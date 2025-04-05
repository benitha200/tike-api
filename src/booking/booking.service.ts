// // booking.service.ts
// import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { CreateBookingDto } from './dto/create-booking.dto';
// import { UpdateBookingDto } from './dto/update-booking.dto';
// import { Booking } from './entities/booking.entity';
// import { InterceptDto } from '../shared/dto/intercept.dto';
// import { Brackets, DataSource, Repository } from 'typeorm';
// import { Trip } from 'src/trip/entities/trip.entity';
// import { HttpException, HttpStatus } from '@nestjs/common';
// import { EmailService } from './email.service';

// @Injectable()
// export class BookingService {
//   constructor(
//     @InjectRepository(Booking)
//     private readonly bookingRepository: Repository<Booking>,
//     @InjectRepository(Trip)
//     private readonly tripRepository: Repository<Trip>,
//     private dataSource: DataSource,
//     private readonly emailService: EmailService,
//   ) { }

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './entities/booking.entity';
import { InterceptDto } from '../shared/dto/intercept.dto';
import { Brackets, DataSource, Repository } from 'typeorm';
import { Trip } from 'src/trip/entities/trip.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EmailService } from './email.service';
import { Console } from 'console';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    private dataSource: DataSource,
    private readonly emailService: EmailService,
  ) { }

  async create(payload: CreateBookingDto): Promise<Booking> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate trip existence
      const trip = await this.tripRepository.findOne({
        where: { id: payload.trip.id }
      });

      if (!trip) {
        throw new NotFoundException(`Trip with ID ${payload.trip.id} not found`);
      }

      // Check seat availability
      if (payload.seat_number) {
        const bookingDate = payload.trip_date; // Use the provided trip_date
        const bookedSeats = await this.getBookedSeatsForTrip(payload.trip.id, bookingDate);
        
        if (bookedSeats.includes(payload.seat_number)) {
          throw new HttpException(
            'This seat is already booked for this date',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Create new booking
      const newBooking = this.bookingRepository.create({
        idempotency_key: payload.idempotency_key,
        is_one_way: payload.is_one_way,
        notes: payload.notes,
        trip: payload.trip,
        price: trip.route.total_price,
        traveler: payload.traveler,
        seat_number: payload.seat_number,
        trip_date: payload.trip_date,
        payment_status: 'PENDING'
      });

      // Save the booking
      const savedBooking = await queryRunner.manager.save(newBooking);
      await queryRunner.commitTransaction();

      return savedBooking;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }


  async findAll(traveler: string, intercept: InterceptDto): Promise<Booking[]> {
    try {
      return await this.bookingRepository
        .createQueryBuilder('bookings')
        .leftJoinAndSelect('bookings.traveler', 'travelers')
        .leftJoinAndSelect('bookings.trip', 'trips')
        .leftJoinAndSelect('trips.departure_location', 'locations as departure')
        .leftJoinAndSelect('trips.arrival_location', 'locations as arrival')
        .leftJoinAndSelect('trips.operator', 'operators')
        .leftJoinAndSelect('trips.car', 'cars')
        .leftJoinAndSelect('trips.driver', 'drivers')
        .where(
          new Brackets((qb) => {
            if (traveler) {
              qb.where('travelers.id = :traveler', { traveler });
            }
          }),
        )
        .orderBy('bookings.createdAt', 'DESC')
        .getMany();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string, intercept: InterceptDto): Promise<Booking> {
    try {
      return await this.bookingRepository
        .createQueryBuilder('bookings')
        .leftJoinAndSelect('bookings.traveler', 'travelers')
        .leftJoinAndSelect('bookings.trip', 'trips')
        .leftJoinAndSelect('trips.departure_location', 'locations as departure')
        .leftJoinAndSelect('trips.arrival_location', 'locations as arrival')
        .leftJoinAndSelect('trips.operator', 'operators')
        .leftJoinAndSelect('trips.car', 'cars')
        .leftJoinAndSelect('trips.driver', 'drivers')
        .where('bookings.id = :id', {
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

  async cancel(id: string, intercept: InterceptDto): Promise<string> {
    try {
      await this.bookingRepository
        .createQueryBuilder()
        .update(Booking)
        .set({ canceled: true })
        .where('id = :id', { id })
        .execute();

      return 'Canceled Booking successfully!';
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePaymentStatus(
    id: string,
    status: 'PENDING' | 'PAID' | 'FAILED',
  ): Promise<Booking> {
    try {
      // Get the booking with all relations
      const booking = await this.findOne(id, new InterceptDto());
      if (!booking) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }

      // Update payment status and reference
      booking.payment_status = status;
      booking.payment_reference = `PAY-${Date.now()}-${id}`;

      // Save the updated booking
      const updatedBooking = await this.bookingRepository.save(booking);

      // Send email notification
      await this.emailService.sendPaymentStatusEmail(updatedBooking);

      return updatedBooking;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async findByPaymentId(paymentId: string): Promise<Booking | null> {
    try {
      return await this.bookingRepository.findOne({
        where: { payment_reference: paymentId },
        relations: ['trip', 'traveler'],
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAvailableSeats(tripId: string, date: string) {
    // Convert the date to ISO format
    const formattedDate = new Date(date).toISOString();

    // Get all possible seats (A1-J4)
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const columns = ['1', '2', '3', '4'];
    const allSeats = rows.flatMap(row => 
      columns.map(col => `${row}${col}`)
    );

    // Get all bookings for this trip that aren't cancelled
    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.trip = :tripId', { tripId })
      .andWhere('booking.trip_date = :date', { date: formattedDate })
      .andWhere('booking.canceled = :canceled', { canceled: false })
      .andWhere('booking.seat_number IS NOT NULL')
      .select(['booking.seat_number', 'booking.payment_status'])
      .getMany();

    // Separate seats by payment status
    const pendingSeats = bookings
      .filter(booking => booking.payment_status === 'PENDING')
      .map(booking => booking.seat_number);

    const paidSeats = bookings
      .filter(booking => booking.payment_status === 'PAID')
      .map(booking => booking.seat_number);

    // All booked seats (both pending and paid)
    const bookedSeats = [...pendingSeats, ...paidSeats];

    // Get available seats (all seats minus booked seats)
    const availableSeats = allSeats.filter(seat => !bookedSeats.includes(seat));

    // Create payment status object for all booked seats
    const paymentStatus = bookings.reduce((acc, booking) => {
      acc[booking.seat_number] = booking.payment_status;
      return acc;
    }, {} as Record<string, string>);

    return {
      total: allSeats.length,
      available: availableSeats,
      pending: pendingSeats,
      paid: paidSeats,
      booked: bookedSeats,
      paymentStatus
    };
  }

  async getBookedSeatsForTrip(tripId: string, date: string): Promise<string[]> {
    const formattedDate = new Date(date).toISOString();

    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.trip = :tripId', { tripId })
      .andWhere('booking.trip_date = :date', { date: formattedDate })
      .andWhere('booking.canceled = :canceled', { canceled: false })
      .andWhere('booking.seat_number IS NOT NULL')
      .getMany();
    return bookings.map(booking => booking.seat_number);
  }

  // async getBookedSeatsForTrip(tripId: string, date: string): Promise<string[]> {
  //   const bookings = await this.bookingRepository
  //     .createQueryBuilder('booking')
  //     .where('booking.trip = :tripId', { tripId })
  //     .andWhere('booking.trip_date = :date', { date })
  //     .andWhere('booking.canceled = :canceled', { canceled: false })
  //     .andWhere('booking.seat_number IS NOT NULL')
  //     .getMany();

  //   return bookings.map(booking => booking.seat_number);
  // }

  // async getAvailableSeats(tripId: string, date: string) {
  //   // Get all possible seats (A1-J4)
  //   const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  //   const columns = ['1', '2', '3', '4'];
  //   const allSeats = rows.flatMap(row => 
  //     columns.map(col => `${row}${col}`)
  //   );
  
  //   // Get all bookings for this trip that aren't cancelled
  //   const bookings = await this.bookingRepository
  //     .createQueryBuilder('booking')
  //     .where('booking.trip = :tripId', { tripId })
  //     .andWhere('booking.canceled = :canceled', { canceled: false })
  //     .andWhere('booking.seat_number IS NOT NULL')
  //     .select(['booking.seat_number', 'booking.payment_status'])
  //     .getMany();
  
  //   // Get all booked seats
  //   const bookedSeats = bookings.map(booking => booking.seat_number);
  
  //   // Create payment status object for all booked seats
  //   const paymentStatus = bookings.reduce((acc, booking) => {
  //     acc[booking.seat_number] = booking.payment_status;
  //     return acc;
  //   }, {} as Record<string, string>);
  
  //   // Get available seats (all seats minus booked seats)
  //   const availableSeats = allSeats.filter(seat => !bookedSeats.includes(seat));
  
  //   return {
  //     total: allSeats.length,
  //     available: availableSeats,
  //     booked: bookedSeats,
  //     paymentStatus
  //   };
  // }

  // async create(payload: CreateBookingDto): Promise<Booking> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     // Now using payload.trip as string (ID)
  //     const bookingDate = new Date().toISOString().split('T')[0];
  //     const bookedSeats = await this.getBookedSeatsForTrip(payload.trip.id, bookingDate);
      
  //     if (payload.seat_number && bookedSeats.includes(payload.seat_number)) {
  //       throw new HttpException(
  //         'This seat is already booked for this date',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }

  //     const trip = await this.tripRepository
  //       .createQueryBuilder('trips')
  //       .where('trips.id = :id', {
  //         id: payload.trip, // This is now correct as it's a string ID
  //       })
  //       .getOne();

  //     const price = trip ? trip.price : 0;

  //     let newBooking = new Booking();
  //     newBooking.idempotency_key = payload.idempotency_key;
  //     newBooking.is_one_way = payload.is_one_way;
  //     newBooking.notes = payload.notes;
  //     newBooking.trip = payload.trip;
  //     newBooking.price = price;
  //     newBooking.traveler = payload.traveler;
  //     newBooking.seat_number = payload.seat_number;
      
  //     newBooking = await queryRunner.manager.save(newBooking);
  //     await queryRunner.commitTransaction();
  //     return newBooking;
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     throw new HttpException(
  //       error.message,
  //       error.status || HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  // Add new method to check seat availability
 
}
