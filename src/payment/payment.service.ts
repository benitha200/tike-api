import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'; // Fixed import
import { ConfigService } from '@nestjs/config';
import { PaymentRequestDto, PaymentResponse } from './dto/payment.dto';
import { IntouchCallback } from './payment.interface';
import { BookingService } from 'src/booking/booking.service';
import { lastValueFrom } from 'rxjs'; // Added for handling observables

@Injectable()
export class PaymentService {
  constructor(
    private bookingService: BookingService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  private generateRequestTransactionId(): string {
    return (Math.floor(Math.random() * 900) + 100).toString();
  }

  private generateTimestamp(): string {
    const now = new Date();
    return now.toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d+/, '')
      .replace('T', '');
  }

  async processPayment(bookingId: string, amount: number, phoneNumber: string): Promise<PaymentResponse> {
    try {
      const paymentRequest: PaymentRequestDto = {
        amount: amount.toString(),
        mobilephone: phoneNumber,
        username: this.configService.get<string>('INTOUCH_USERNAME'),
        password: this.configService.get<string>('INTOUCH_PASSWORD'),
        callbackurl: `${this.configService.get<string>('BASE_URL')}/api/payment/callback`,
      };

      const response = await lastValueFrom(this.httpService.post(
        'https://www.intouchpay.co.rw/api/requestpayment/',
        {
          ...paymentRequest,
          transactionId: this.generateRequestTransactionId(),
          requesttransactionid: this.generateRequestTransactionId(),
          timestamp: this.generateTimestamp(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ));

      // Store the payment request details with updated method signature
      await this.bookingService.updatePaymentStatus(bookingId, 'PENDING');

      return response.data;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  async handlePaymentCallback(callback: IntouchCallback): Promise<void> {
    const { jsonpayload } = callback;
    const { requesttransactionid, status, responsecode } = jsonpayload;

    // Find the booking associated with this payment
    const booking = await this.bookingService.findByPaymentId(requesttransactionid);

    if (!booking) {
      throw new Error(`No booking found for payment ID ${requesttransactionid}`);
    }

    // Update booking status based on payment response with correct method signature
    if (status === 'SUCCESS' && responsecode === '200') {
      await this.bookingService.updatePaymentStatus(booking.id, 'PAID');
    } else {
      await this.bookingService.updatePaymentStatus(booking.id, 'FAILED');
    }
  }
}