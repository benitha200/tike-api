import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';

@Module({
  imports: [TypeOrmModule.forFeature([Trip])],
  exports: [TripModule, TripService],
  controllers: [TripController],
  providers: [TripService],
})
export class TripModule {}
