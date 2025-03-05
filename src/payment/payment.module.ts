import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { BookingModule } from '../booking/booking.module';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    HttpModule,
    BookingModule,
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}