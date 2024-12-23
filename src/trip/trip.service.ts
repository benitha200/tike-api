import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InterceptDto } from 'src/shared/dto/intercept.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip } from './entities/trip.entity';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    private dataSource: DataSource,
  ) {}

  async create(payload: CreateTripDto): Promise<Trip> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      let newTrip = new Trip();
      newTrip.idempotency_key = payload.idempotency_key;
      newTrip.departure_location = payload.departure_location;
      newTrip.departure_time = payload.departure_time;
      newTrip.arrival_location = payload.arrival_location;
      newTrip.arrival_time = payload.arrival_time;
      newTrip.price = payload.price;
      newTrip.operator = payload.operator;
      newTrip.car = payload.car;
      newTrip.driver = payload.driver;
      newTrip.total_seats = payload.total_seats;
      newTrip.is_daily = true; 
      
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
        .createQueryBuilder('trips')
        .leftJoinAndSelect('trips.departure_location', 'locations as departure')
        .leftJoinAndSelect('trips.arrival_location', 'locations as arrival')
        .leftJoinAndSelect('trips.operator', 'operators')
        .leftJoinAndSelect('trips.car', 'cars')
        .leftJoinAndSelect('trips.driver', 'drivers')
        .getMany();

      // Get current date
      const currentDate = new Date();
      const currentDateStr = currentDate.toISOString().split('T')[0];

      // Format times and add next occurrence for daily trips
      return trips.map(trip => {
        const tripTime = trip.departure_time;
        const nextTripDateTime = new Date(`${currentDateStr}T${tripTime}`);
        
        // If the trip time has already passed today, set it for tomorrow
        if (nextTripDateTime < currentDate) {
          nextTripDateTime.setDate(nextTripDateTime.getDate() + 1);
        }

        return {
          ...trip,
          departure_time: trip.departure_time,
          arrival_time: trip.arrival_time,
          next_occurrence: trip.is_daily ? nextTripDateTime : null,
          formatted_departure_time: new Date(`1970-01-01T${trip.departure_time}`).toLocaleTimeString(),
          formatted_arrival_time: new Date(`1970-01-01T${trip.arrival_time}`).toLocaleTimeString()
        };
      });
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findUpcoming(days: number = 7): Promise<Trip[]> {
    try {
      const trips = await this.tripRepository
        .createQueryBuilder('trips')
        .leftJoinAndSelect('trips.departure_location', 'locations as departure')
        .leftJoinAndSelect('trips.arrival_location', 'locations as arrival')
        .leftJoinAndSelect('trips.operator', 'operators')
        .leftJoinAndSelect('trips.car', 'cars')
        .leftJoinAndSelect('trips.driver', 'drivers')
        .where('trips.is_daily = :isDaily', { isDaily: true })
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
              formatted_arrival_time: new Date(`1970-01-01T${trip.arrival_time}`).toLocaleTimeString()
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
        .leftJoinAndSelect('trips.departure_location', 'locations as departure')
        .leftJoinAndSelect('trips.arrival_location', 'locations as arrival')
        .leftJoinAndSelect('trips.operator', 'operators')
        .leftJoinAndSelect('trips.car', 'cars')
        .leftJoinAndSelect('trips.driver', 'drivers')
        .where('trips.id = :id', {
          id,
        })
        .getOne();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, payload: UpdateTripDto): Promise<string> {
    const {
      departure_location,
      departure_time,
      arrival_location,
      arrival_time,
      price,
      operator,
      car,
      driver,
    } = payload;

    try {
      await this.tripRepository
        .createQueryBuilder()
        .update(Trip)
        .set({
          departure_location,
          departure_time,
          arrival_location,
          arrival_time,
          price,
          operator,
          car,
          driver,
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
