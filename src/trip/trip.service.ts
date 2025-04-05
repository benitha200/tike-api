import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InterceptDto } from 'src/shared/dto/intercept.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip } from './entities/trip.entity';
import { Route } from 'src/route/entities/routes.entity';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    private dataSource: DataSource
  ) {}

  async create(payload: CreateTripDto): Promise<Trip> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {

      // Create a new Trip entity
      let newTrip = new Trip();
      newTrip.idempotency_key = payload.idempotency_key;
      newTrip.route = payload.route;
      newTrip.departure_time = payload.departure_time;
      // newTrip.arrival_time = payload.arrival_time;
      newTrip.operator = payload.operator;
      newTrip.car = payload.car;
      newTrip.driver = payload.driver;
      newTrip.total_seats = payload.total_seats;
      newTrip.is_daily = true;

      // Save the new trip to the database
      newTrip = await queryRunner.manager.save(newTrip);
      await queryRunner.commitTransaction();
      return newTrip;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(intercept: InterceptDto): Promise<Trip[]> {
    try {
      const trips = await this.tripRepository
        .createQueryBuilder(`trips`)
        .leftJoinAndSelect(`trips.route`, `route`)
        .leftJoinAndSelect(`route.departure_location`, `departure_location`)
        .leftJoinAndSelect(`route.arrival_location`, `arrival_location`)
        .leftJoinAndSelect(`trips.operator`, `operator`)
        .leftJoinAndSelect(`trips.car`, `car`)
        .leftJoinAndSelect(`trips.driver`, `driver`)
        .getMany();
  
      const currentDate = new Date();
      const currentDateStr = currentDate.toISOString().split(`T`)[0];
  
      return trips.map(trip => {
        const tripTime = trip.departure_time;
        const nextTripDateTime = new Date(`${currentDateStr}T${tripTime}`);
        if (nextTripDateTime < currentDate) {
          nextTripDateTime.setDate(nextTripDateTime.getDate() + 1);
        }
  
        return {
          ...trip,
          next_occurrence: trip.is_daily ? nextTripDateTime : null,
          formatted_departure_time: new Date(`1970-01-01T${trip.departure_time}`).toLocaleTimeString(),
          // formatted_arrival_time: new Date(`1970-01-01T${trip.arrival_time}`).toLocaleTimeString()
        };
      });
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async findUpcoming(days: number = 7): Promise<Trip[]> {
    try {
      const trips = await this.tripRepository
      .createQueryBuilder(`trips`)
      .leftJoinAndSelect(`trips.route`, `route`)
      .leftJoinAndSelect(`route.departure_location`, `departure_location`)
      .leftJoinAndSelect(`route.arrival_location`, `arrival_location`)
      .leftJoinAndSelect(`trips.operator`, `operators`)
      .leftJoinAndSelect(`trips.car`, `cars`)
      .leftJoinAndSelect(`trips.driver`, `drivers`)
      .getMany();
    

      const currentDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      // Generate daily occurrences for the specified period
      const upcomingTrips = [];
      trips.forEach(trip => {
        let currentOccurrence = new Date(currentDate);
        
        while (currentOccurrence <= endDate) {
          const [hours, minutes] = trip.departure_time.split(':');
          currentOccurrence.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          if (currentOccurrence >= currentDate && currentOccurrence <= endDate) {
            upcomingTrips.push({
              ...trip,
              scheduled_date: new Date(currentOccurrence),
              formatted_departure_time: new Date(`1970-01-01T${trip.departure_time}`).toLocaleTimeString(),
              // formatted_arrival_time: new Date(`1970-01-01T${trip.arrival_time}`).toLocaleTimeString()
            });
          }

          // Move to next day
          currentOccurrence = new Date(currentOccurrence.setDate(currentOccurrence.getDate() + 1));
        }
      });

      // Sort by scheduled date and time
      return upcomingTrips.sort((a, b) => a.scheduled_date.getTime() - b.scheduled_date.getTime());
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string, intercept: InterceptDto): Promise<Trip> {
    try {
      return await this.tripRepository
        .createQueryBuilder('trips')
        .leftJoinAndSelect(`trips.route`, `route`)
        .leftJoinAndSelect(`route.departure_location`, `departure_location`)
        .leftJoinAndSelect(`route.arrival_location`, `arrival_location`)
        .leftJoinAndSelect('trips.operator', 'operators')
        .leftJoinAndSelect('trips.car', 'cars')
        .leftJoinAndSelect('trips.driver', 'drivers')
        .where('trips.id = :id', { id })
        .getOne();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, payload: UpdateTripDto): Promise<string> {
    const { route, departure_time, arrival_time, operator, car, driver, total_seats, is_daily } = payload;
  
    try {
    
      // Update the Trip entity
      await this.tripRepository
        .createQueryBuilder()
        .update(Trip)
        .set({
          departure_time,
          // arrival_time,
          route,
          operator,
          car,
          driver,
          total_seats,
          is_daily,
        })
        .where('id = :id', { id })
        .execute();
  
      return 'Updated Trip successfully!';
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  

  async remove(id: string, intercept: InterceptDto): Promise<string> {
    try {
      await this.tripRepository
        .createQueryBuilder('trips')
        .softDelete()
        .where('id = :id', { id })
        .execute();

      return 'Trip deleted successfully!';
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
