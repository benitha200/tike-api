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

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from 'src/trip/entities/trip.entity';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { PaymentService } from 'src/payment/payment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Trip])],
  exports: [BookingService, PaymentService],
  controllers: [BookingController],
  providers: [BookingService, PaymentService],
})
export class BookingModule {}