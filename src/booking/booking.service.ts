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
import { Route } from 'src/route/entities/routes.entity';
import { RouteStop } from 'src/route-stop/entities/route-stop.entity';


@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    @InjectRepository(RouteStop)
    private readonly routeStopRepository: Repository<RouteStop>,
    private dataSource: DataSource,
    private readonly emailService: EmailService,
  ) { }

  async create(payload: CreateBookingDto): Promise<Booking> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Validate trip existence and populate trip.route
      console.log('Trip ID:', payload.trip);
      
      const trip = await this.tripRepository.findOne({
        where: { id: payload.trip.id },
        relations: ['route', 'route.routeStops']
      });
     const instop= await this.routeStopRepository.findOne({
        where: { id: payload.instop , routeId: trip.route.id }
      });
      const outstop =  await this.routeStopRepository.findOne({
        where: { id: payload.outstop, routeId: trip.route.id }
      }) ;


      console.log('In-stop:', instop);
      console.log('In-stop ID:', payload.instop);
      console.log('Out-stop:', outstop);
      console.log('Out-stop ID:', payload.outstop);
      if (!instop) {
        throw new NotFoundException(`In-stop with ID ${payload.instop} not found in the trip's route`);
      }
      if (outstop && !outstop) {
        throw new NotFoundException(`Out-stop with ID ${payload.outstop} not found in the trip's route`);
      }

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
        route: trip.route,
        routeId: trip.route.id,
        routeName: trip.route.name,
        inStop: instop,
        inStopId:  instop?.id,
        inStopName: instop?.stopName,
        outStop:outstop,
        outStopId: outstop?.id,
        outStopName: outstop?.stopName,
        price: calculatePrice(trip, instop, outstop),
        traveler: payload.traveler,
        seat_number: payload.seat_number,
        trip_date: payload.trip_date,
        departure_time: calculateStopArrivalTime(trip, instop),
        arrival_time: calculateStopArrivalTime(trip, outstop),
        arrival_date: calculateStopArrivalDate(trip,payload.trip_date,instop, outstop),
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

}

// Utility functions
// These functions are used to calculate the price and arrival times for the booking

function calculatePrice(trip: Trip, instop: RouteStop, outstop: RouteStop): number {
  if (!trip || !instop || !outstop) {
    throw new Error('Trip, instop, and outstop must be provided to calculate the price.');
  }

  // Ensure the route stops are part of the trip's route
  const routeStops = trip.route?.routeStops || [];
  const inStopIndex = routeStops.findIndex(stop => stop.id === instop.id);
  const outStopIndex = routeStops.findIndex(stop => stop.id === outstop.id);

  if (inStopIndex === -1 || outStopIndex === -1) {
    throw new Error('Invalid instop or outstop for the given trip route.');
  }

  if (inStopIndex >= outStopIndex) {
    throw new Error('Outstop must come after instop on the route.');
  }

  // Calculate the price based on the difference between the stops' prices
  const inStopPrice = instop.price || 0;
  const outStopPrice = outstop.price || 0;

  if (inStopPrice === 0 || outStopPrice === 0) {
    // If one of the stops is not present, return the route's total price
    return trip.route?.total_price || 0;
  }

  return Math.abs(outStopPrice - inStopPrice);
}

function calculateStopArrivalTime(trip: Trip, stop: RouteStop): string {
  const departure = new Date(`1970-01-01T${trip.departure_time}`);
  const stopOrder = stop.stopOrder;

  let totalDuration = 0;
  for (let i = 0; i < stopOrder; i++) {
    const previousStop = trip.route.routeStops.find(s => s.stopOrder === i);
    if (previousStop) {
      totalDuration += previousStop.duration;
    }
  }

  departure.setMinutes(departure.getMinutes() + totalDuration + stop.duration);
  const arrivalTimeStr = `${String(departure.getHours()).padStart(2, '0')}:${String(departure.getMinutes()).padStart(2, '0')}`;
  return arrivalTimeStr;
}
function calculateStopArrivalDate(trip: Trip, trip_date: string, instop: RouteStop, outstop?: RouteStop): string {
  const tripStartDate = new Date(trip_date); // Use the provided trip_date directly
  const routeStops = trip.route.routeStops || [];

  let totalDuration = 0;

  // Calculate the total duration up to the instop
  for (let i = 0; i < instop.stopOrder; i++) {
    const stop = routeStops.find(s => s.stopOrder === i);
    if (stop) {
      totalDuration += stop.duration;
    }
  }

  // If outstop is provided, add the duration from instop to outstop
  if (outstop) {
    for (let i = instop.stopOrder; i < outstop.stopOrder; i++) {
      const stop = routeStops.find(s => s.stopOrder === i);
      if (stop) {
        totalDuration += stop.duration;
      }
    }
  }

  // Add the total duration to the trip start date
  tripStartDate.setMinutes(tripStartDate.getMinutes() + totalDuration);

  // Return only the date part in YYYY-MM-DD format
  return tripStartDate.toISOString().split('T')[0];
}
