import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from 'src/car/entities/car.entity';
import { Driver } from 'src/driver/entities/driver.entity';
import { Location } from 'src/location/entities/location.entity';
import { Operator } from 'src/operator/entities/operator.entity';
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
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(Operator)
    private readonly operatorRepository: Repository<Operator>,
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
      return await this.tripRepository
        .createQueryBuilder('trips')
        .leftJoinAndSelect('trips.departure_location', 'locations as departure')
        .leftJoinAndSelect('trips.arrival_location', 'locations as arrival')
        .leftJoinAndSelect('trips.operator', 'operators')
        .leftJoinAndSelect('trips.car', 'cars')
        .leftJoinAndSelect('trips.driver', 'drivers')
        .getMany();
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

      return 'Updated location successfully!';
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
