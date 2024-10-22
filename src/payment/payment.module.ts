import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentService } from './payment.service';
// import { PaymentController } from './payment.controller';
import { BookingModule } from '../booking/booking.module';
import { PaymentController } from './payment.controller';

@Module({
  imports: [
    HttpModule,
    BookingModule,
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}