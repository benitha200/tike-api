import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { lastValueFrom } from 'rxjs';

import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InterceptDto } from '../shared/dto/intercept.dto';
import { BookingService } from '../booking/booking.service';
import { Console } from 'console';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly bookingService: BookingService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) { }

  private determineApiKey(phoneNumber: string): string {
    // Remove any leading '+' or '0' from the phone number
    const cleanedNumber = phoneNumber.replace(/^(\+?0)/, '');

    // Check different mobile network prefixes
    if (['79', '78'].includes(cleanedNumber.slice(0, 2)) ||
      ['78', '79'].includes(cleanedNumber.slice(0, 2))) {
      return this.configService.get('ITECPAY_KEY_MOMO');
    }

    // Check Airtel network prefixes
    if (['72', '73'].includes(cleanedNumber.slice(0, 2)) ||
      ['72', '73'].includes(cleanedNumber.slice(0, 2))) {
      return this.configService.get('ITECPAY_KEY_AIRTEL');
    }

    throw new HttpException('Unsupported phone number provider', HttpStatus.BAD_REQUEST);
  }


  async processPayment(
    bookingId: string,
    amount: number,
    phoneNumber: string
  ): Promise<{ payment: Payment; itechpayResponse?: any }> {
    try {
      // Validate input parameters
      if (!bookingId || !amount || !phoneNumber) {
        throw new HttpException('Missing required payment parameters', HttpStatus.BAD_REQUEST);
      }
  
      if (amount <= 0) {
        throw new HttpException('Amount must be greater than 0', HttpStatus.BAD_REQUEST);
      }
  
      try {
        // Verify booking exists
        const booking = await this.findBookingOrThrow(bookingId);
      } catch (error) {
        throw new HttpException('Invalid booking ID', HttpStatus.BAD_REQUEST);
      }
  
      // Check for existing pending payment
      try {
        const existingPendingPayment = await this.paymentRepository.findOne({
          where: {
            bookingId,
            status: PaymentStatus.PENDING,
          },
        });
  
        if (existingPendingPayment) {
          // Update booking status to PENDING
          await this.bookingService.updatePaymentStatus(bookingId, 'PENDING');
          
          return {
            payment: existingPendingPayment,
            itechpayResponse: {
              status: 'PENDING',
              message: 'Existing pending payment found'
            }
          };
        }
      } catch (error) {
        console.error('Error checking pending payment:', error);
      }
  
      let apiKey: string;
      try {
        apiKey = this.determineApiKey(phoneNumber);
      } catch (error) {
        throw new HttpException(
          'Failed to process payment: Invalid phone number',
          HttpStatus.BAD_REQUEST
        );
      }
  
      const paymentPayload = {
        amount,
        phone: phoneNumber,
        key: apiKey
      };
  
      let payment;
      try {
        payment = await this.create({
          bookingId,
          amount,
          phoneNumber,
          requestTransactionId: `booking-${bookingId}-${Date.now()}`,
          status: PaymentStatus.PENDING,
        });

        // Update booking status to PENDING when payment is created
        await this.bookingService.updatePaymentStatus(bookingId, 'PENDING');
      } catch (error) {
        console.error('Error creating payment record:', error);
        throw new HttpException(
          'Failed to initialize payment',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
  
      try {
        const response = await lastValueFrom(
          this.httpService.post('https://pay.itecpay.rw/api/pay', paymentPayload, {
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 300000, // 5 minutes timeout
          })
        );
  
        const responseData = response.data;
        
        // Success scenarios
        if (responseData.status === 200 && responseData.data) {
          await this.paymentRepository.update(payment.id, {
            status: PaymentStatus.PAID,
            responseCode: '200',
            transactionId: responseData.data.transID,
            callbackPayload: responseData
          });

          // Update booking status to PAID
          await this.bookingService.updatePaymentStatus(bookingId, 'PAID');
  
          return {
            payment: await this.findOne(payment.id),
            itechpayResponse: responseData
          };
        }
  
        // Failure scenarios
        if (parseInt(responseData.status) === 400 || responseData.data?.message) {
          const errorMessage = responseData.data?.message || 'Payment processing failed';
          
          await this.paymentRepository.update(payment.id, {
            status: PaymentStatus.FAILED,
            responseCode: '400',
            callbackPayload: responseData
          });

          // Update booking status to FAILED
          await this.bookingService.updatePaymentStatus(bookingId, 'FAILED');
  
          throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
        }

        if (responseData.status === 500 || responseData.data?.message) {
          const errorMessage = responseData.data?.message || 'Payment processing failed';
          
          await this.paymentRepository.update(payment.id, {
            status: PaymentStatus.FAILED,
            responseCode: '500',
            callbackPayload: responseData
          });

          // Update booking status to FAILED
          await this.bookingService.updatePaymentStatus(bookingId, 'FAILED');
  
          throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
        }
  
        throw new HttpException(
          'Unexpected payment response',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
  
      } catch (error) {
        if (error.response?.data?.message?.includes('balance')) {
          await this.paymentRepository.update(payment.id, {
            status: PaymentStatus.FAILED,
            responseCode: 'BALANCE_ERROR',
            callbackPayload: error.response.data
          });

          // Update booking status to FAILED
          await this.bookingService.updatePaymentStatus(bookingId, 'FAILED');
          
          throw new HttpException(
            'Failed to process payment, check your balance and try again',
            HttpStatus.BAD_REQUEST
          );
        }
  
        const errorPayload = {
          message: error.message,
          response: error.response?.data,
          stack: error.stack
        };
  
        await this.paymentRepository.update(payment.id, {
          status: PaymentStatus.FAILED,
          responseCode: 'ERROR',
          callbackPayload: errorPayload
        });

        // Update booking status to FAILED
        await this.bookingService.updatePaymentStatus(bookingId, 'FAILED');
  
        throw new HttpException(
          error.response?.data?.message || 
          error.message || 
          'Payment processing encountered an unexpected error',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Unexpected error in processPayment:', error);
      throw new HttpException(
        'Payment processing encountered an unexpected error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
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

  async checkPaymentStatus(bookingId: string): Promise<{ status: string; metaData?: any }> {
    try {
      // Find the most recent payment for this booking
      const payment = await this.paymentRepository.findOne({
        where: { bookingId },
        order: { createdAt: 'DESC' },
        relations: ['booking']
      });
  
      if (!payment) {
        return {
          status: 'not_found',
          metaData: { message: ['No payment found for this booking'] }
        };
      }
  
      // Map payment status to frontend-friendly status
      switch (payment.status) {
        case PaymentStatus.PENDING:
          return {
            status: 'pending',
            metaData: { 
              payment,
              message: ['Payment is still processing']
            }
          };
        case PaymentStatus.PAID:
          return {
            status: 'success',
            metaData: { 
              payment,
              message: ['Payment successful'] 
            }
          };
        case PaymentStatus.FAILED:
          return {
            status: 'failed',
            metaData: { 
              payment,
              message: [payment.callbackPayload?.data?.message || 'Payment failed']
            }
          };
        default:
          return {
            status: 'unknown',
            metaData: { 
              payment,
              message: ['Undefined payment status'] 
            }
          };
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw new HttpException(
        'Error checking payment status', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
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