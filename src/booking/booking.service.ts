// import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { InterceptDto } from 'src/shared/dto/intercept.dto';
// import { Trip } from 'src/trip/entities/trip.entity';
// import { Brackets, DataSource, Repository } from 'typeorm';
// import { CreateBookingDto } from './dto/create-booking.dto';
// import { Booking } from './entities/booking.entity';

// @Injectable()
// export class BookingService {
//   constructor(
//     @InjectRepository(Booking)
//     private readonly bookingRepository: Repository<Booking>,
//     @InjectRepository(Trip)
//     private readonly tripRepository: Repository<Trip>,
//     private dataSource: DataSource,
//   ) {}

//   async create(payload: CreateBookingDto): Promise<Booking> {
//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const trip = await this.tripRepository
//         .createQueryBuilder('trips')
//         .where('trips.id = :id', {
//           id: payload.trip,
//         })
//         .getOne();
//       const price = trip ? trip.price : 0;

//       let newBooking = new Booking();
//       newBooking.idempotency_key = payload.idempotency_key;
//       newBooking.is_one_way = payload.is_one_way;
//       newBooking.notes = payload.notes;
//       newBooking.trip = payload.trip;
//       newBooking.price = price;
//       newBooking.traveler = payload.traveler;
//       newBooking = await queryRunner.manager.save(newBooking);
//       await queryRunner.commitTransaction();
//       return newBooking;
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       throw new HttpException(
//         error.message,
//         error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   async findAll(traveler: string, intercept: InterceptDto): Promise<Booking[]> {
//     try {
//       return await this.bookingRepository
//         .createQueryBuilder('bookings')
//         .leftJoinAndSelect('bookings.traveler', 'travelers')
//         .leftJoinAndSelect('bookings.trip', 'trips')
//         .leftJoinAndSelect('trips.departure_location', 'locations as departure')
//         .leftJoinAndSelect('trips.arrival_location', 'locations as arrival')
//         .leftJoinAndSelect('trips.operator', 'operators')
//         .leftJoinAndSelect('trips.car', 'cars')
//         .leftJoinAndSelect('trips.driver', 'drivers')
//         .where(
//           new Brackets((qb) => {
//             if (traveler) {
//               qb.where('travelers.id = :traveler', { traveler });
//             }
//           }),
//         )
//         .getMany();
//     } catch (error) {
//       throw new HttpException(
//         error.message,
//         error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   async findOne(id: string, intercept: InterceptDto): Promise<Booking> {
//     try {
//       return await this.bookingRepository
//         .createQueryBuilder('bookings')
//         .leftJoinAndSelect('bookings.traveler', 'travelers')
//         .leftJoinAndSelect('bookings.trip', 'trips')
//         .leftJoinAndSelect('trips.departure_location', 'locations as departure')
//         .leftJoinAndSelect('trips.arrival_location', 'locations as arrival')
//         .leftJoinAndSelect('trips.operator', 'operators')
//         .leftJoinAndSelect('trips.car', 'cars')
//         .leftJoinAndSelect('trips.driver', 'drivers')
//         .where('bookings.id = :id', {
//           id,
//         })
//         .getOne();
//     } catch (error) {
//       throw new HttpException(
//         error.message,
//         error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   async cancel(id: string, intercept: InterceptDto): Promise<string> {
//     try {
//       await this.bookingRepository
//         .createQueryBuilder()
//         .update(Booking)
//         .set({ canceled: true })
//         .where('id = :id', { id })
//         .execute();

//       return 'Canceled Booking successfully!';
//     } catch (error) {
//       throw new HttpException(
//         error.message,
//         error.status || HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }
// }

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const booking = this.bookingRepository.create(createBookingDto);
    return await this.bookingRepository.save(booking);
  }

  async findAll(traveler: string, intercept: any): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { traveler: { id: traveler } },
      relations: ['trip', 'traveler'],
    });
  }

  async findOne(id: string, intercept: any): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['trip', 'traveler'],
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }
    return booking;
  }

  async cancel(id: string, intercept: any): Promise<string> {
    const booking = await this.findOne(id, intercept);
    booking.canceled = true;
    await this.bookingRepository.save(booking);
    return 'Booking canceled successfully';
  }

  async updatePaymentStatus(id: string, status: 'PENDING' | 'PAID' | 'FAILED'): Promise<Booking> {
    const booking = await this.findOne(id, {});
    booking.payment_status = status; // Convert status to boolean
    booking.payment_reference = status; // You might want to add this field to your entity
    return await this.bookingRepository.save(booking);
  }

  async findByPaymentId(paymentId: string): Promise<Booking | null> {
    return await this.bookingRepository.findOne({
      where: { payment_reference: paymentId },
      relations: ['trip', 'traveler'],
    });
  }
}