
// booking.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from 'src/trip/entities/trip.entity';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import { Route } from 'src/route/entities/routes.entity';
import { RouteStop } from 'src/route-stop/entities/route-stop.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Trip,Route,RouteStop]),
    ConfigModule,
    HttpModule,
  ],
  exports: [BookingService,EmailService],
  controllers: [BookingController],
  providers: [BookingService,EmailService],
})
export class BookingModule {}