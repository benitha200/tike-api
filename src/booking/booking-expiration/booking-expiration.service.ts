import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class BookingExpirationService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectQueue('booking-expiration') private bookingExpirationQueue: Queue,
  ) {}

  async createBookingExpirationJob(bookingId: string): Promise<void> {
    // Add a job to the queue to expire the booking after 5 minutes
    // Delay for the configured number of minutes (in ms)
    const delayMinutes = parseInt(process.env.BOOKING_EXPIRATION_MINUTES || '5', 10);
    await this.bookingExpirationQueue.add(
      'expire-booking',
      { bookingId },
      { delay: delayMinutes * 60 * 1000 }
    );
    console.log(`Booking expiration job created for booking ID: ${bookingId} with a delay of ${delayMinutes} minutes`);
  }

  async checkAndExpireBooking(bookingId: string): Promise<void> {
    const booking = await this.bookingRepository.findOne({ where: { id: bookingId } });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // If the booking is still pending after 5 minutes, mark it as failed
    if (booking.payment_status === 'PENDING') {
      booking.payment_status = 'FAILED';
      booking.canceled = true;
      await this.bookingRepository.save(booking);
    }
  }
}
