// booking.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './entities/booking.entity';
import { InterceptDto } from '../shared/dto/intercept.dto';
import { Brackets, DataSource, Repository } from 'typeorm';
import { Trip } from 'src/trip/entities/trip.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EmailService } from './email.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    private dataSource: DataSource,
    private readonly emailService: EmailService,
  ) {}


    async create(payload: CreateBookingDto): Promise<Booking> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const trip = await this.tripRepository
        .createQueryBuilder('trips')
        .where('trips.id = :id', {
          id: payload.trip,
        })
        .getOne();
      const price = trip ? trip.price : 0;

      let newBooking = new Booking();
      newBooking.idempotency_key = payload.idempotency_key;
      newBooking.is_one_way = payload.is_one_way;
      newBooking.notes = payload.notes;
      newBooking.trip = payload.trip;
      newBooking.price = price;
      newBooking.traveler = payload.traveler;
      newBooking = await queryRunner.manager.save(newBooking);
      await queryRunner.commitTransaction();
      return newBooking;
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

  // async updatePaymentStatus(id: string, status: 'PENDING' | 'PAID' | 'FAILED'): Promise<Booking> {
  //   try {
  //     const booking = await this.findOne(id, new InterceptDto());
  //     booking.payment_status = status;
  //     booking.payment_reference = `PAY-${Date.now()}-${id}`;
  //     return await this.bookingRepository.save(booking);
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw error;
  //     }
  //     throw new BadRequestException(error.message);
  //   }
  // }


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
}
