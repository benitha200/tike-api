// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Trip } from 'src/trip/entities/trip.entity';
// import { BookingController } from './booking.controller';
// import { BookingService } from './booking.service';
// import { Booking } from './entities/booking.entity';

// @Module({
//   imports: [TypeOrmModule.forFeature([Booking, Trip])],
//   exports: [BookingModule, BookingService],
//   controllers: [BookingController],
//   providers: [BookingService],
// })
// export class BookingModule {}

// booking.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from 'src/trip/entities/trip.entity';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Trip]),
    HttpModule,
  ],
  exports: [BookingService],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}