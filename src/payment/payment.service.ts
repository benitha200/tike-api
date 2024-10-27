
// import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { ConfigService } from '@nestjs/config';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { lastValueFrom } from 'rxjs';
// import { PaymentRequestDto, PaymentResponse } from './dto/payment.dto';
// import { IntouchCallback } from './payment.interface';
// import { BookingService } from '../booking/booking.service';
// import { Payment, PaymentStatus } from './entities/payment.entity';
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
//     const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
//     return `${timestamp}${random}`;
//   }

//   private generateTimestamp(): string {
//     return new Date().toISOString()
//       .replace(/[-:]/g, '')
//       .replace(/\.\d+/, '')
//       .replace('T', '');
//   }

//   private async findBookingOrThrow(bookingId: string) {
//     try {
//       const booking = await this.bookingService.findOne(bookingId, new InterceptDto());
//       if (!booking) {
//         throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
//       }
//       return booking;
//     } catch (error) {
//       if (error instanceof HttpException) {
//         throw error;
//       }
//       throw new HttpException('Error finding booking', HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }

//   private async findPaymentByTransactionId(requestTransactionId: string): Promise<Payment> {
//     const payment = await this.paymentRepository.findOne({
//       where: { requestTransactionId },
//       relations: ['booking'],
//     });

//     if (!payment) {
//       throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
//     }
//     return payment;
//   }

//   async processPayment(
//     bookingId: string,
//     amount: number,
//     phoneNumber: string
//   ): Promise<Payment> {
//     try {
//       if (!bookingId || !amount || !phoneNumber) {
//         throw new HttpException('Missing required payment parameters', HttpStatus.BAD_REQUEST);
//       }
  
//       if (amount <= 0) {
//         throw new HttpException('Amount must be greater than 0', HttpStatus.BAD_REQUEST);
//       }
  
//       const booking = await this.findBookingOrThrow(bookingId);
  
//       // Check if there's already a pending payment for this booking
//       const existingPendingPayment = await this.paymentRepository.findOne({
//         where: {
//           bookingId,
//           status: PaymentStatus.PENDING,
//         },
//       });
  
//       if (existingPendingPayment) {
//         throw new HttpException('Pending payment already exists for this booking', HttpStatus.CONFLICT);
//       }
  
//       const requestTransactionId = this.generateRequestTransactionId();
//       const paymentRequest: PaymentRequestDto = {
//         username: this.configService.get<string>('INTOUCH_USERNAME'),
//         timestamp: this.generateTimestamp(),
//         amount: amount.toString(),
//         password: this.configService.get<string>('INTOUCH_PASSWORD'),
//         mobilephone: phoneNumber,
//         requesttransactionid: requestTransactionId,
//         callbackurl: `${this.configService.get<string>('BASE_URL')}/payments/callback`,
//       };
  
//       const payment = await this.create({
//         bookingId,
//         amount,
//         phoneNumber,
//         requestTransactionId,
//         status: PaymentStatus.PENDING,
//       });
  
//       try {
//         await lastValueFrom(this.httpService.post<PaymentResponse>(
//           this.configService.get<string>('INTOUCH_API_URL'),
//           paymentRequest,
//           { 
//             headers: { 'Content-Type': 'application/json' }, 
//             timeout: 10000,
//             validateStatus: (status) => true // Accept any status code
//           }
//         ));
  
//         // If we reach here, the request was sent successfully regardless of the response
//         await this.bookingService.updatePaymentStatus(bookingId, PaymentStatus.PENDING);
//         return payment;
  
//       } catch (error) {
//         // Only throw if there's a network error or timeout
//         if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
//           // Clean up the payment record if the API call fails
//           await this.paymentRepository.remove(payment);
//           throw new HttpException(
//             'Payment service unavailable. Please try again later.',
//             HttpStatus.INTERNAL_SERVER_ERROR
//           );
//         }
  
//         // For all other cases, consider it a successful request
//         await this.bookingService.updatePaymentStatus(bookingId, PaymentStatus.PENDING);
//         return payment;
//       }
//     } catch (error) {
//       if (error instanceof HttpException) {
//         throw error;
//       }
//       throw new HttpException('Payment processing failed', HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }

//   async handlePaymentCallback(callback: IntouchCallback): Promise<void> {
//     try {
//       const { jsonpayload } = callback;
//       const { requesttransactionid, status, responsecode } = jsonpayload;

//       const payment = await this.findPaymentByTransactionId(requesttransactionid);
      
//       if (payment.status !== PaymentStatus.PENDING) {
//         throw new HttpException('Payment is not in pending status', HttpStatus.BAD_REQUEST);
//       }

//       const paymentStatus = status === 'SUCCESS' && responsecode === '200'
//         ? PaymentStatus.PAID
//         : PaymentStatus.FAILED;

//       await this.update(payment.id, {
//         status: paymentStatus,
//         responseCode: responsecode,
//         callbackPayload: jsonpayload,
//       });

//       await this.bookingService.updatePaymentStatus(payment.bookingId, paymentStatus);
//     } catch (error) {
//       if (error instanceof HttpException) {
//         throw error;
//       }
//       throw new HttpException('Error processing payment callback', HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }

//   async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
//     try {
//       const payment = this.paymentRepository.create(createPaymentDto);
//       return await this.paymentRepository.save(payment);
//     } catch (error) {
//       throw new HttpException('Error creating payment', HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }

//   async findOne(id: string): Promise<Payment> {
//     try {
//       const payment = await this.paymentRepository.findOne({
//         where: { id },
//         relations: ['booking'],
//       });

//       if (!payment) {
//         throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
//       }
//       return payment;
//     } catch (error) {
//       if (error instanceof HttpException) {
//         throw error;
//       }
//       throw new HttpException('Error finding payment', HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }

//   async findAll(intercept: InterceptDto): Promise<Payment[]> {
//     try {
//       return await this.paymentRepository.find({
//         relations: ['booking'],
//         order: {
//           createdAt: 'DESC',
//         },
//       });
//     } catch (error) {
//       throw new HttpException('Error fetching payments', HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }

//   async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
//     try {
//       const payment = await this.findOne(id);
//       const updatedPayment = this.paymentRepository.merge(payment, updatePaymentDto);
//       return await this.paymentRepository.save(updatedPayment);
//     } catch (error) {
//       if (error instanceof HttpException) {
//         throw error;
//       }
//       throw new HttpException('Error updating payment', HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }

//   async remove(id: string): Promise<void> {
//     try {
//       const payment = await this.findOne(id);
//       if (payment.status === PaymentStatus.PENDING) {
//         throw new HttpException(
//           'Cannot delete a pending payment',
//           HttpStatus.BAD_REQUEST
//         );
//       }
//       await this.paymentRepository.remove(payment);
//     } catch (error) {
//       if (error instanceof HttpException) {
//         throw error;
//       }
//       throw new HttpException('Error removing payment', HttpStatus.INTERNAL_SERVER_ERROR);
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

  async checkTransactionStatus(requestTransactionId: string): Promise<any> {
    try {
      const statusRequest = {
        username: this.configService.get<string>('INTOUCH_USERNAME'),
        timestamp: this.generateTimestamp(),
        password: this.configService.get<string>('INTOUCH_PASSWORD'),
        requesttransactionid: requestTransactionId,
        transactionid: requestTransactionId
      };

      const response = await lastValueFrom(this.httpService.post(
        this.configService.get<string>('INTOUCH_STATUS_API_URL'),
        statusRequest,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      ));

      return response.data;
    } catch (error) {
      console.error('Error checking transaction status:', error);
      throw new HttpException(
        'Failed to check transaction status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async startStatusCheck(payment: Payment): Promise<void> {
    let attempts = 0;
    const maxAttempts = 20; // Will check for 10 minutes (20 attempts * 30 seconds)

    const checkStatus = async () => {
      try {
        if (attempts >= maxAttempts) {
          // Stop checking after max attempts
          await this.update(payment.id, {
            status: PaymentStatus.FAILED,
            responseCode: 'TIMEOUT',
            callbackPayload: { message: 'Status check timeout' }
          });
          await this.bookingService.updatePaymentStatus(payment.bookingId, PaymentStatus.FAILED);
          return;
        }

        const statusResponse = await this.checkTransactionStatus(payment.requestTransactionId);

        if (statusResponse.success) {
          if (statusResponse.status === 'SUCCESS' && statusResponse.responsecode === '1000') {
            // Payment successful
            await this.update(payment.id, {
              status: PaymentStatus.PAID,
              responseCode: statusResponse.responsecode,
              callbackPayload: statusResponse
            });
            await this.bookingService.updatePaymentStatus(payment.bookingId, PaymentStatus.PAID);
            return; // Stop checking
          } else if (statusResponse.status === 'Pending') {
            // Continue checking
            attempts++;
            setTimeout(checkStatus, 30000); // Check again after 30 seconds
          } else {
            // Payment failed
            await this.update(payment.id, {
              status: PaymentStatus.FAILED,
              responseCode: statusResponse.responsecode,
              callbackPayload: statusResponse
            });
            await this.bookingService.updatePaymentStatus(payment.bookingId, PaymentStatus.FAILED);
            return; // Stop checking
          }
        } else if (statusResponse.responsecode === '3200') {
          // Transaction doesn't exist
          await this.update(payment.id, {
            status: PaymentStatus.FAILED,
            responseCode: statusResponse.responsecode,
            callbackPayload: statusResponse
          });
          await this.bookingService.updatePaymentStatus(payment.bookingId, PaymentStatus.FAILED);
          return; // Stop checking
        } else {
          // Other failure cases
          attempts++;
          setTimeout(checkStatus, 30000); // Check again after 30 seconds
        }
      } catch (error) {
        console.error('Status check error:', error);
        attempts++;
        setTimeout(checkStatus, 30000); // Retry after 30 seconds even on error
      }
    };

    // Start the status check process
    checkStatus();
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
        username: this.configService.get<string>('INTOUCH_USERNAME'),
        timestamp: this.generateTimestamp(),
        amount: amount.toString(),
        password: this.configService.get<string>('INTOUCH_PASSWORD'),
        mobilephone: phoneNumber,
        requesttransactionid: requestTransactionId,
        callbackurl: `${this.configService.get<string>('BASE_URL')}/payments/callback`,
      };
  
      const payment = await this.create({
        bookingId,
        amount,
        phoneNumber,
        requestTransactionId,
        status: PaymentStatus.PENDING,
      });
  
      try {
        await lastValueFrom(this.httpService.post<PaymentResponse>(
          this.configService.get<string>('INTOUCH_API_URL'),
          paymentRequest,
          { 
            headers: { 'Content-Type': 'application/json' }, 
            timeout: 10000,
            validateStatus: (status) => true // Accept any status code
          }
        ));
  
        // Start status checking in the background
        this.startStatusCheck(payment);
  
        await this.bookingService.updatePaymentStatus(bookingId, PaymentStatus.PENDING);
        return payment;
  
      } catch (error) {
        // Only throw if there's a network error or timeout
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
          // Clean up the payment record if the API call fails
          await this.paymentRepository.remove(payment);
          throw new HttpException(
            'Payment service unavailable. Please try again later.',
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
  
        // For all other cases, start status checking and return payment
        this.startStatusCheck(payment);
        await this.bookingService.updatePaymentStatus(bookingId, PaymentStatus.PENDING);
        return payment;
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Payment processing failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    try {
      const payment = this.paymentRepository.create(createPaymentDto);
      return await this.paymentRepository.save(payment);
    } catch (error) {
      throw new HttpException('Error creating payment', HttpStatus.INTERNAL_SERVER_ERROR);
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
  
  async findAll(intercept: InterceptDto): Promise<Payment[]> {
    try {
      return await this.paymentRepository.find({
        relations: ['booking'],
        order: {
          createdAt: 'DESC',
        },
        // You can add more query options based on your InterceptDto if needed
      });
    } catch (error) {
      throw new HttpException('Error fetching payments', HttpStatus.INTERNAL_SERVER_ERROR);
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
}