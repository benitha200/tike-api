// import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { ConfigService } from '@nestjs/config';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { lastValueFrom } from 'rxjs';
// import { PaymentRequestDto, PaymentResponse } from './dto/payment.dto';
// import { IntouchCallback } from './payment.interface';
// import { BookingService } from 'src/booking/booking.service';
// import { Payment } from './entities/payment.entity';
// import { CreatePaymentDto } from './dto/create-payment.dto';
// import { UpdatePaymentDto } from './dto/update-payment.dto';
// import { InterceptDto } from '../shared/dto/intercept.dto';

// @Injectable()
// export class PaymentService {
//   constructor(
//     @InjectRepository(Payment)
//     private readonly paymentRepository: Repository<Payment>,
//     private readonly bookingService: BookingService,
//     private readonly httpService: HttpService,
//     private readonly configService: ConfigService,
//   ) {}

//   private generateRequestTransactionId(): string {
//     const timestamp = Date.now();
//     const random = Math.floor(Math.random() * 10000);
//     return `${timestamp}${random}`;
//   }

//   private generateTimestamp(): string {
//     const now = new Date();
//     return now
//       .toISOString()
//       .replace(/[-:]/g, '')
//       .replace(/\.\d+/, '')
//       .replace('T', '');
//   }

//   // async processPayment(
//   //   bookingId: string,
//   //   amount: number,
//   //   phoneNumber: string,
//   // ): Promise<PaymentResponse> {
//   //   try {
//   //     if (!bookingId || !amount || !phoneNumber) {
//   //       throw new HttpException(
//   //         'Missing required payment parameters',
//   //         HttpStatus.BAD_REQUEST,
//   //       );
//   //     }

//   //     // Verify booking exists - now passing empty object as intercept
//   //     const booking = await this.bookingService.findOne(bookingId, {});
//   //     if (!booking) {
//   //       throw new HttpException(
//   //         'Booking not found',
//   //         HttpStatus.NOT_FOUND,
//   //       );
//   //     }

//   //     const requestTransactionId = this.generateRequestTransactionId();
//   //     const paymentRequest: PaymentRequestDto = {
//   //       amount: amount.toString(),
//   //       mobilephone: phoneNumber,
//   //       username: this.configService.get<string>('INTOUCH_USERNAME'),
//   //       password: this.configService.get<string>('INTOUCH_PASSWORD'),
//   //       callbackurl: `${this.configService.get<string>('BASE_URL')}/payments/callback`,
//   //       transactionId: requestTransactionId,
//   //       requesttransactionid: requestTransactionId,
//   //       timestamp: this.generateTimestamp(),
//   //     };

//   //     // Create payment record before making the request
//   //     await this.create({
//   //       bookingId,
//   //       amount,
//   //       phoneNumber,
//   //       requestTransactionId,
//   //       status: 'PENDING',
//   //     });

//   //     const response = await lastValueFrom(
//   //       this.httpService.post<PaymentResponse>(
//   //         this.configService.get<string>('INTOUCH_API_URL'),
//   //         paymentRequest,
//   //         {
//   //           headers: {
//   //             'Content-Type': 'application/json',
//   //           },
//   //           timeout: 10000,
//   //         },
//   //       ),
//   //     );

//   //     // Update booking status
//   //     await this.bookingService.updatePaymentStatus(bookingId, 'PENDING');

//   //     return response.data;
//   //   } catch (error) {
//   //     console.error('Payment processing error:', error);
      
//   //     if (error instanceof HttpException) {
//   //       throw error;
//   //     }

//   //     throw new HttpException(
//   //       'Payment processing failed',
//   //       HttpStatus.INTERNAL_SERVER_ERROR,
//   //     );
//   //   }
//   // }

  
//   async processPayment(
//     bookingId: string,
//     amount: number,
//     phoneNumber: string,
//   ): Promise<Payment> {
//     try {
//       if (!bookingId || !amount || !phoneNumber) {
//         throw new HttpException(
//           'Missing required payment parameters',
//           HttpStatus.BAD_REQUEST,
//         );
//       }

//       const booking = await this.bookingService.findOne(bookingId, {});
//       if (!booking) {
//         throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
//       }

//       const requestTransactionId = this.generateRequestTransactionId();
//       const paymentRequest: PaymentRequestDto = {
//         amount: amount.toString(),
//         mobilephone: phoneNumber,
//         username: this.configService.get<string>('INTOUCH_USERNAME'),
//         password: this.configService.get<string>('INTOUCH_PASSWORD'),
//         callbackurl: `${this.configService.get<string>('BASE_URL')}/payments/callback`,
//         transactionId: requestTransactionId,
//         requesttransactionid: requestTransactionId,
//         timestamp: this.generateTimestamp(),
//       };

//       // Create payment record
//       const payment = await this.create({
//         bookingId,
//         amount,
//         phoneNumber,
//         requestTransactionId,
//         status: 'PENDING',
//       });

//       // Make API call
//       const response = await lastValueFrom(
//         this.httpService.post<PaymentResponse>(
//           this.configService.get<string>('INTOUCH_API_URL'),
//           paymentRequest,
//           {
//             headers: { 'Content-Type': 'application/json' },
//             timeout: 10000,
//           },
//         ),
//       );

//       // Update booking status
//       await this.bookingService.updatePaymentStatus(bookingId, 'PENDING');

//       // Return the payment entity
//       return payment;
//     } catch (error) {
//       console.error('Payment processing error:', error);
//       if (error instanceof HttpException) throw error;
//       throw new HttpException(
//         'Payment processing failed',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   async handlePaymentCallback(callback: IntouchCallback): Promise<void> {
//     try {
//       const { jsonpayload } = callback;
//       const { requesttransactionid, status, responsecode } = jsonpayload;

//       // Find the payment record
//       const payment = await this.findByTransactionId(requesttransactionid);
//       if (!payment) {
//         throw new HttpException(
//           `No payment found for transaction ID ${requesttransactionid}`,
//           HttpStatus.NOT_FOUND,
//         );
//       }

//       // Find the booking associated with this payment
//       const booking = await this.bookingService.findByPaymentId(requesttransactionid);
//       if (!booking) {
//         throw new HttpException(
//           `No booking found for payment ID ${requesttransactionid}`,
//           HttpStatus.NOT_FOUND,
//         );
//       }

//       // Update payment status
//       const paymentStatus = status === 'SUCCESS' && responsecode === '200' ? 'PAID' : 'FAILED';
//       await this.update(payment.id, { 
//         status: paymentStatus,
//         responseCode: responsecode,
//         callbackPayload: jsonpayload,
//       });

//       // Update booking status
//       await this.bookingService.updatePaymentStatus(booking.id, paymentStatus);
//     } catch (error) {
//       console.error('Payment callback processing error:', error);
//       throw error;
//     }
//   }

//   async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
//     try {
//       const payment = this.paymentRepository.create({
//         ...createPaymentDto,
//         status: 'PENDING',
//       });

//       return await this.paymentRepository.save(payment);
//     } catch (error) {
//       console.error('Create payment error:', error);
//       throw new HttpException(
//         'Failed to create payment record',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   // async findAll(): Promise<Payment[]> {
//   //   try {
//   //     return await this.paymentRepository.find({
//   //       relations: ['booking'],
//   //       order: { createdAt: 'DESC' },
//   //     });
//   //   } catch (error) {
//   //     console.error('Find all payments error:', error);
//   //     throw new HttpException(
//   //       'Failed to fetch payments',
//   //       HttpStatus.INTERNAL_SERVER_ERROR,
//   //     );
//   //   }
//   // }

//   async findOne(id: string, intercept: any = {}): Promise<Payment> {
//     try {
//       const payment = await this.paymentRepository.findOne({
//         where: { id },
//         relations: ['booking'],
//       });

//       if (!payment) {
//         throw new HttpException(
//           'Payment not found',
//           HttpStatus.NOT_FOUND,
//         );
//       }

//       return payment;
//     } catch (error) {
//       if (error instanceof HttpException) {
//         throw error;
//       }
      
//       throw new HttpException(
//         'Failed to fetch payment',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   async findByTransactionId(requestTransactionId: string): Promise<Payment> {
//     try {
//       const payment = await this.paymentRepository.findOne({
//         where: { requestTransactionId },
//         relations: ['booking'],
//       });

//       if (!payment) {
//         throw new HttpException(
//           'Payment not found',
//           HttpStatus.NOT_FOUND,
//         );
//       }

//       return payment;
//     } catch (error) {
//       if (error instanceof HttpException) {
//         throw error;
//       }

//       throw new HttpException(
//         'Failed to fetch payment',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }



//   async findAll(intercept: InterceptDto): Promise<Payment[]> {
//     try {
//       return await this.paymentRepository.find({
//         relations: ['booking'],
//         order: { createdAt: 'DESC' },
//       });
//     } catch (error) {
//       console.error('Find all payments error:', error);
//       throw new HttpException(
//         'Failed to fetch payments',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
//     try {
//       const payment = await this.findOne(id, {});
//       const updatedPayment = this.paymentRepository.merge(payment, updatePaymentDto);
//       return await this.paymentRepository.save(updatedPayment);
//     } catch (error) {
//       if (error instanceof HttpException) throw error;
//       throw new HttpException(
//         'Failed to update payment',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }

//   async remove(id: string, intercept: InterceptDto): Promise<Payment> {
//     try {
//       const payment = await this.findOne(id, intercept);
//       return await this.paymentRepository.remove(payment);
//     } catch (error) {
//       if (error instanceof HttpException) throw error;
//       throw new HttpException(
//         'Failed to delete payment',
//         HttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }
// }

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { lastValueFrom } from 'rxjs';
import { PaymentRequestDto, PaymentResponse } from './dto/payment.dto';
import { IntouchCallback } from './payment.interface';
import { BookingService } from '../booking/booking.service';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InterceptDto } from '../shared/dto/intercept.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly bookingService: BookingService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private generateRequestTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${timestamp}${random}`;
  }

  private generateTimestamp(): string {
    return new Date().toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d+/, '')
      .replace('T', '');
  }

  private async findBookingOrThrow(bookingId: string) {
    try {
      const booking = await this.bookingService.findOne(bookingId, new InterceptDto());
      if (!booking) {
        throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
      }
      return booking;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error finding booking', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async findPaymentByTransactionId(requestTransactionId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { requestTransactionId },
      relations: ['booking'],
    });

    if (!payment) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }
    return payment;
  }

  async processPayment(
    bookingId: string,
    amount: number,
    phoneNumber: string
  ): Promise<Payment> {
    try {
      if (!bookingId || !amount || !phoneNumber) {
        throw new HttpException('Missing required payment parameters', HttpStatus.BAD_REQUEST);
      }

      if (amount <= 0) {
        throw new HttpException('Amount must be greater than 0', HttpStatus.BAD_REQUEST);
      }

      const booking = await this.findBookingOrThrow(bookingId);

      // Check if there's already a pending payment for this booking
      const existingPendingPayment = await this.paymentRepository.findOne({
        where: {
          bookingId,
          status: PaymentStatus.PENDING,
        },
      });

      if (existingPendingPayment) {
        throw new HttpException('Pending payment already exists for this booking', HttpStatus.CONFLICT);
      }

      const requestTransactionId = this.generateRequestTransactionId();
      const paymentRequest: PaymentRequestDto = {
        amount: amount.toString(),
        mobilephone: phoneNumber,
        username: this.configService.get<string>('INTOUCH_USERNAME'),
        password: this.configService.get<string>('INTOUCH_PASSWORD'),
        callbackurl: `${this.configService.get<string>('BASE_URL')}/payments/callback`,
        transactionId: requestTransactionId,
        requesttransactionid: requestTransactionId,
        timestamp: this.generateTimestamp(),
      };

      const payment = await this.create({
        bookingId,
        amount,
        phoneNumber,
        requestTransactionId,
        status: PaymentStatus.PENDING,
      });

      try {
        const response = await lastValueFrom(this.httpService.post<PaymentResponse>(
          this.configService.get<string>('INTOUCH_API_URL'),
          paymentRequest,
          { 
            headers: { 'Content-Type': 'application/json' }, 
            timeout: 10000 
          }
        ));

        if (response.data?.status !== 'SUCCESS') {
          throw new HttpException(
            response.data?.message || 'Payment initiation failed',
            HttpStatus.BAD_REQUEST
          );
        }

        await this.bookingService.updatePaymentStatus(bookingId, PaymentStatus.PENDING);
        return payment;
      } catch (error) {
        // Clean up the payment record if the API call fails
        await this.paymentRepository.remove(payment);
        
        if (error instanceof HttpException) {
          throw error;
        }
        
        console.error('Payment processing error:', error);
        throw new HttpException(
          'Payment processing failed. Please try again later.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Payment processing failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async handlePaymentCallback(callback: IntouchCallback): Promise<void> {
    try {
      const { jsonpayload } = callback;
      const { requesttransactionid, status, responsecode } = jsonpayload;

      const payment = await this.findPaymentByTransactionId(requesttransactionid);
      
      if (payment.status !== PaymentStatus.PENDING) {
        throw new HttpException('Payment is not in pending status', HttpStatus.BAD_REQUEST);
      }

      const paymentStatus = status === 'SUCCESS' && responsecode === '200'
        ? PaymentStatus.PAID
        : PaymentStatus.FAILED;

      await this.update(payment.id, {
        status: paymentStatus,
        responseCode: responsecode,
        callbackPayload: jsonpayload,
      });

      await this.bookingService.updatePaymentStatus(payment.bookingId, paymentStatus);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error processing payment callback', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    try {
      const payment = this.paymentRepository.create(createPaymentDto);
      return await this.paymentRepository.save(payment);
    } catch (error) {
      throw new HttpException('Error creating payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string): Promise<Payment> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { id },
        relations: ['booking'],
      });

      if (!payment) {
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      }
      return payment;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error finding payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(intercept: InterceptDto): Promise<Payment[]> {
    try {
      return await this.paymentRepository.find({
        relations: ['booking'],
        order: {
          createdAt: 'DESC',
        },
      });
    } catch (error) {
      throw new HttpException('Error fetching payments', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    try {
      const payment = await this.findOne(id);
      const updatedPayment = this.paymentRepository.merge(payment, updatePaymentDto);
      return await this.paymentRepository.save(updatedPayment);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error updating payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const payment = await this.findOne(id);
      if (payment.status === PaymentStatus.PENDING) {
        throw new HttpException(
          'Cannot delete a pending payment',
          HttpStatus.BAD_REQUEST
        );
      }
      await this.paymentRepository.remove(payment);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error removing payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
