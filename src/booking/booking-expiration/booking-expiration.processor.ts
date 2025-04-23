import { Processor, Process } from '@nestjs/bull';
import { BookingExpirationService } from './booking-expiration.service';
import { Job } from 'bull';

@Processor('booking-expiration') // This matches the queue name
export class BookingExpirationProcessor {
  constructor(private readonly bookingExpirationService: BookingExpirationService) {}

  @Process('expire-booking')
  async expireBookingJob(job: Job) {
    const { bookingId } = job.data;
    await this.bookingExpirationService.checkAndExpireBooking(bookingId);
  }
}
