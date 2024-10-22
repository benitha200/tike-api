import { Controller, Post, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { IntouchCallback } from './payment.interface';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('process/:bookingId')
  async processPayment(
    @Param('bookingId') bookingId: string,
    @Body() paymentData: { amount: number; phoneNumber: string },
  ) {
    return await this.paymentService.processPayment(
      bookingId,
      paymentData.amount,
      paymentData.phoneNumber,
    );
  }

  @Post('callback')
  async handleCallback(@Body() callback: IntouchCallback) {
    await this.paymentService.handlePaymentCallback(callback);
    return { message: 'Callback processed successfully' };
  }
}
