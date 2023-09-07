import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from 'src/car/entities/car.entity';
import { Driver } from 'src/driver/entities/driver.entity';
import { Location } from 'src/location/entities/location.entity';
import { Operator } from 'src/operator/entities/operator.entity';
import { Trip } from './entities/trip.entity';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';

@Module({
  imports: [TypeOrmModule.forFeature([Trip, Car, Location, Driver, Operator])],
  exports: [TripModule, TripService],
  controllers: [TripController],
  providers: [TripService],
})
export class TripModule {}
