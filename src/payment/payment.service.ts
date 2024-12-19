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

//   async checkTransactionStatus(requestTransactionId: string, transactionId: string): Promise<any> {
//     try {
//       const statusRequest = {
//         username: this.configService.get<string>('INTOUCH_USERNAME'),
//         timestamp: this.configService.get<string>('INTOUCH_TIMESTAMP'),
//         password: this.configService.get<string>('INTOUCH_PASSWORD'),
//         requesttransactionid: requestTransactionId,
//         transactionid: transactionId
//       };

//       console.log('Status check request:', statusRequest);

//       const response = await lastValueFrom(
//         this.httpService.post(
//           this.configService.get<string>('INTOUCH_STATUS_API_URL'),
//           statusRequest,
//           {
//             headers: { 
//               'Content-Type': 'application/json',
//               'Accept': 'application/json'
//             },
//             timeout: 30000, // Increased timeout
//             validateStatus: status => true // Accept any status code
//           }
//         )
//       );

//       console.log('Status check response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('Error checking transaction status:', error.response?.data || error.message);
//       throw new HttpException(
//         'Failed to check transaction status',
//         HttpStatus.INTERNAL_SERVER_ERROR
//       );
//     }
//   }

//   async startStatusCheck(payment: Payment): Promise<void> {
//     let attempts = 0;
//     const maxAttempts = 20; // Will check for 10 minutes (20 attempts * 30 seconds)

//     const checkStatus = async () => {
//       try {
//         if (attempts >= maxAttempts) {
//           await this.update(payment.id, {
//             status: PaymentStatus.FAILED,
//             responseCode: 'TIMEOUT',
//             callbackPayload: { message: 'Status check timeout' }
//           });
//           await this.bookingService.updatePaymentStatus(payment.bookingId, PaymentStatus.FAILED);
//           return;
//         }

//         if (!payment.callbackPayload?.transactionid) {
//           console.error('No transaction ID found in payment:', payment);
//           throw new Error('Transaction ID not found in callback payload');
//         }

//         const statusResponse = await this.checkTransactionStatus(
//           payment.requestTransactionId,
//           payment.callbackPayload.transactionid
//         );

//         console.log('Status check attempt', attempts + 1, 'response:', statusResponse);

//         // Check for successful payment - both "Successfull" and "SUCCESS" spellings
//         if (statusResponse.success && 
//             (statusResponse.status === 'Successfull' || statusResponse.status === 'SUCCESS') && 
//             (statusResponse.responsecode === '01' || statusResponse.responsecode === '1000')) {
//           await this.update(payment.id, {
//             status: PaymentStatus.PAID,
//             responseCode: statusResponse.responsecode,
//             callbackPayload: statusResponse
//           });
//           await this.bookingService.updatePaymentStatus(payment.bookingId, PaymentStatus.PAID);
//           return;
//         } 
//         // Check for pending status
//         else if (statusResponse.status === 'Pending' || 
//                  statusResponse.responsecode === '1000' || 
//                  statusResponse.responsecode === '02') {
//           attempts++;
//           setTimeout(checkStatus, 30000); // Check again after 30 seconds
//         } 
//         // Handle explicit failure cases
//         else if (statusResponse.status === 'Failed' || 
//                  statusResponse.responsecode === '03' || 
//                  statusResponse.responsecode === '3200') {
//           await this.update(payment.id, {
//             status: PaymentStatus.FAILED,
//             responseCode: statusResponse.responsecode,
//             callbackPayload: statusResponse
//           });
//           await this.bookingService.updatePaymentStatus(payment.bookingId, PaymentStatus.FAILED);
//           return;
//         }
//         // Handle other cases as pending
//         else {
//           attempts++;
//           setTimeout(checkStatus, 30000);
//         }
//       } catch (error) {
//         console.error('Status check error:', error);
//         attempts++;
//         if (attempts >= maxAttempts) {
//           await this.update(payment.id, {
//             status: PaymentStatus.FAILED,
//             responseCode: 'ERROR',
//             callbackPayload: { error: error.message }
//           });
//           await this.bookingService.updatePaymentStatus(payment.bookingId, PaymentStatus.FAILED);
//         } else {
//           setTimeout(checkStatus, 30000);
//         }
//       }
//     };

//     // Start the status check process
//     checkStatus();
//   }

//   async processPayment(
//     bookingId: string,
//     amount: number,
//     phoneNumber: string
//   ): Promise<{ payment: any; intouchResponse?: any }> {
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
//         username: this.configService.get('INTOUCH_USERNAME'),
//         timestamp: this.configService.get('INTOUCH_TIMESTAMP'),
//         amount: amount.toString(),
//         password: this.configService.get('INTOUCH_PASSWORD'),
//         mobilephone: phoneNumber,
//         requesttransactionid: requestTransactionId,
//         callbackurl: `${this.configService.get('BASE_URL')}/payments/callback`,
//       };

//       const payment = await this.create({
//         bookingId,
//         amount,
//         phoneNumber,
//         requestTransactionId,
//         status: PaymentStatus.PENDING,
//       });

//       try {
//         const response = await lastValueFrom(
//           this.httpService.post(
//             this.configService.get('INTOUCH_API_URL'),
//             paymentRequest,
//             {
//               headers: { 'Content-Type': 'application/json' },
//               timeout: 10000,
//               validateStatus: (status) => true // Accept any status code
//             }
//           )
//         );

//         // Store response information in responseCode and callbackPayload
//         await this.paymentRepository.update(payment.id, {
//           responseCode: response.status.toString(),
//           callbackPayload: response.data
//         });

//         // Check for specific error responses from Intouch
//         if (response.status >= 400) {
//           const errorMessage = response.data?.message || 'Payment request failed';
//           await this.paymentRepository.update(payment.id, {
//             status: PaymentStatus.FAILED,
//             responseCode: response.status.toString(),
//             callbackPayload: {
//               message: errorMessage,
//               ...response.data
//             }
//           });
//           throw new HttpException(errorMessage, response.status);
//         }

//         // Start status checking in the background
//         this.startStatusCheck(payment);

//         await this.bookingService.updatePaymentStatus(bookingId, PaymentStatus.PENDING);

//         return {
//           payment,
//           intouchResponse: response.data
//         };

//       } catch (error) {
//         // Handle network errors
//         if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
//           await this.paymentRepository.update(payment.id, {
//             status: PaymentStatus.FAILED,
//             responseCode: 'ERROR',
//             callbackPayload: {
//               // message: 'Payment service unavailable',
//               error: error.message
//             }
//           });
//           throw new HttpException(
//             'Payment service unavailable. Please try again later.',
//             HttpStatus.INTERNAL_SERVER_ERROR
//           );
//         }

//         // If it's already an HttpException (from our error checks above), rethrow it
//         if (error instanceof HttpException) {
//           throw error;
//         }

//         // Start status checking and return payment for other types of errors
//         this.startStatusCheck(payment);
//         await this.bookingService.updatePaymentStatus(bookingId, PaymentStatus.PENDING);

//         return {
//           payment,
//           intouchResponse: error.response?.data
//         };
//       }
//     } catch (error) {
//       if (error instanceof HttpException) {
//         throw error;
//       }
//       throw new HttpException(
//         error.response?.data?.message || 'Payment processing failed',
//         HttpStatus.INTERNAL_SERVER_ERROR
//       );
//     }
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

//   async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
//     try {
//       const payment = this.paymentRepository.create(createPaymentDto);
//       return await this.paymentRepository.save(payment);
//     } catch (error) {
//       throw new HttpException('Error creating payment', HttpStatus.INTERNAL_SERVER_ERROR);
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

//   async findAll(intercept: InterceptDto): Promise<Payment[]> {
//     try {
//       return await this.paymentRepository.find({
//         relations: ['booking'],
//         order: {
//           createdAt: 'DESC',
//         },
//         // You can add more query options based on your InterceptDto if needed
//       });
//     } catch (error) {
//       throw new HttpException('Error fetching payments', HttpStatus.INTERNAL_SERVER_ERROR);
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
// }


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

  // works  but don't update booking
  // async processPayment(
  //   bookingId: string,
  //   amount: number,
  //   phoneNumber: string
  // ): Promise<{ payment: Payment; itechpayResponse?: any }> {
  //   try {
  //     // Validate input parameters
  //     if (!bookingId || !amount || !phoneNumber) {
  //       throw new HttpException('Missing required payment parameters', HttpStatus.BAD_REQUEST);
  //     }
  
  //     if (amount <= 0) {
  //       throw new HttpException('Amount must be greater than 0', HttpStatus.BAD_REQUEST);
  //     }
  
  //     // Verify booking exists
  //     const booking = await this.findBookingOrThrow(bookingId);
  
  //     // Check for existing pending payment
  //     const existingPendingPayment = await this.paymentRepository.findOne({
  //       where: {
  //         bookingId,
  //         status: PaymentStatus.PENDING,
  //       },
  //     });
  
  //     if (existingPendingPayment) {
  //       return {
  //         payment: existingPendingPayment,
  //         itechpayResponse: {
  //           status: 'PENDING',
  //           message: 'Existing pending payment found'
  //         }
  //       };
  //     }
  
  //     // Determine the correct API key based on phone number
  //     const apiKey = this.determineApiKey(phoneNumber);
  
  //     // Prepare payment request payload
  //     const paymentPayload = {
  //       amount,
  //       phone: phoneNumber,
  //       key: apiKey
  //     };
  
  //     // Create initial payment record
  //     const payment = await this.create({
  //       bookingId,
  //       amount,
  //       phoneNumber,
  //       requestTransactionId: `booking-${bookingId}-${Date.now()}`,
  //       status: PaymentStatus.PENDING,
  //     });
  
  //     try {
  //       // Send payment request to Itechpay with an extended timeout
  //       const response = await lastValueFrom(
  //         this.httpService.post('https://pay.itecpay.rw/api/pay', paymentPayload, {
  //           headers: { 
  //             'Content-Type': 'application/json',
  //             'Accept': 'application/json'
  //           },
  //           timeout: 300000, // 5 minutes timeout
  //         })
  //       );
  
  //       // More comprehensive response handling
  //       const responseData = response.data;
        
  //       // Success scenarios
  //       if (responseData.status === 200 && responseData.data) {
  //         await this.paymentRepository.update(payment.id, {
  //           status: PaymentStatus.PAID,
  //           responseCode: '200',
  //           transactionId: responseData.data.transID,
  //           callbackPayload: responseData // Pass the entire response object
  //         });
  
  //         return {
  //           payment: await this.findOne(payment.id),
  //           itechpayResponse: responseData
  //         };
  //       }
  
  //       // Failure scenarios
  //       if (responseData.status === 400 || responseData.data?.message) {
  //         const errorMessage = responseData.data?.message || 'Payment processing failed';
          
  //         await this.paymentRepository.update(payment.id, {
  //           status: PaymentStatus.FAILED,
  //           responseCode: '400',
  //           callbackPayload: responseData // Pass the entire response object
  //         });
  
  //         throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
  //       }
  
  //       // Catch-all for unexpected responses
  //       throw new HttpException(
  //         'Unexpected payment response',
  //         HttpStatus.INTERNAL_SERVER_ERROR
  //       );
  
  //     } catch (error) {
  //       // Safely handle axios errors and other exceptions
  //       const errorPayload = {
  //         message: error.message,
  //         response: error.response?.data,
  //         stack: error.stack
  //       };
  
  //       // Update payment status to failed
  //       await this.paymentRepository.update(payment.id, {
  //         status: PaymentStatus.FAILED,
  //         responseCode: 'ERROR',
  //         callbackPayload: errorPayload // Pass error details as an object
  //       });
  
  //       // Throw a more informative error
  //       throw new HttpException(
  //         error.response?.data?.message || 
  //         error.message || 
  //         'Payment processing encountered an unexpected error',
  //         error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
  //       );
  //     }
  //   } catch (error) {
  //     // Re-throw HttpExceptions, wrap others
  //     if (error instanceof HttpException) {
  //       throw error;
  //     }
  //     throw new HttpException(
  //       'Payment processing encountered an unexpected error',
  //       HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

  // async processPayment(
  //   bookingId: string,
  //   amount: number,
  //   phoneNumber: string
  // ): Promise<{ payment: Payment; itechpayResponse?: any }> {
  //   try {
  //     // Validate input parameters
  //     if (!bookingId || !amount || !phoneNumber) {
  //       throw new HttpException('Missing required payment parameters', HttpStatus.BAD_REQUEST);
  //     }
  
  //     if (amount <= 0) {
  //       throw new HttpException('Amount must be greater than 0', HttpStatus.BAD_REQUEST);
  //     }
  
  //     try {
  //       // Verify booking exists
  //       const booking = await this.findBookingOrThrow(bookingId);
  //     } catch (error) {
  //       throw new HttpException('Invalid booking ID', HttpStatus.BAD_REQUEST);
  //     }
  
  //     // Check for existing pending payment
  //     try {
  //       const existingPendingPayment = await this.paymentRepository.findOne({
  //         where: {
  //           bookingId,
  //           status: PaymentStatus.PENDING,
  //         },
  //       });
  
  //       if (existingPendingPayment) {
  //         return {
  //           payment: existingPendingPayment,
  //           itechpayResponse: {
  //             status: 'PENDING',
  //             message: 'Existing pending payment found'
  //           }
  //         };
  //       }
  //     } catch (error) {
  //       console.error('Error checking pending payment:', error);
  //       // Continue processing if checking for pending payment fails
  //     }
  
  //     let apiKey: string;
  //     try {
  //       // Determine the correct API key based on phone number
  //       apiKey = this.determineApiKey(phoneNumber);
  //     } catch (error) {
  //       throw new HttpException(
  //         'Failed to process payment: Invalid phone number',
  //         HttpStatus.BAD_REQUEST
  //       );
  //     }
  
  //     // Prepare payment request payload
  //     const paymentPayload = {
  //       amount,
  //       phone: phoneNumber,
  //       key: apiKey
  //     };
  
  //     let payment;
  //     try {
  //       // Create initial payment record
  //       payment = await this.create({
  //         bookingId,
  //         amount,
  //         phoneNumber,
  //         requestTransactionId: `booking-${bookingId}-${Date.now()}`,
  //         status: PaymentStatus.PENDING,
  //       });
  //     } catch (error) {
  //       console.error('Error creating payment record:', error);
  //       throw new HttpException(
  //         'Failed to initialize payment',
  //         HttpStatus.INTERNAL_SERVER_ERROR
  //       );
  //     }
  
  //     try {
  //       // Send payment request to Itechpay with an extended timeout
  //       const response = await lastValueFrom(
  //         this.httpService.post('https://pay.itecpay.rw/api/pay', paymentPayload, {
  //           headers: { 
  //             'Content-Type': 'application/json',
  //             'Accept': 'application/json'
  //           },
  //           timeout: 300000, // 5 minutes timeout
  //         })
  //       );
  
  //       // More comprehensive response handling
  //       const responseData = response.data;
  //       console.log("reponse data")
  //       console.log(responseData.status ===400 && responseData.data);
        
  //       // Success scenarios
  //       if (responseData.status === 200 && responseData.data) {
  //         await this.paymentRepository.update(payment.id, {
  //           status: PaymentStatus.PAID,
  //           responseCode: '200',
  //           transactionId: responseData.data.transID,
  //           callbackPayload: responseData
  //         });
  
  //         return {
  //           payment: await this.findOne(payment.id),
  //           itechpayResponse: responseData
  //         };
  //       }
  
  //       // Failure scenarios
  //       if (parseInt(responseData.status) === 400 || responseData.data?.message) {
  //         const errorMessage = responseData.data?.message || 'Payment processing failed';
          
  //         await this.paymentRepository.update(payment.id, {
  //           status: PaymentStatus.FAILED,
  //           responseCode: '400',
  //           callbackPayload: responseData
  //         });
  
  //         throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
  //       }

  //       if (responseData.status === 500 || responseData.data?.message) {
  //         const errorMessage = responseData.data?.message || 'Payment processing failed';
          
  //         await this.paymentRepository.update(payment.id, {
  //           status: PaymentStatus.FAILED,
  //           responseCode: '500',
  //           callbackPayload: responseData
  //         });
  
  //         throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
  //       }
  
  //       // Catch-all for unexpected responses
  //       throw new HttpException(
  //         'Unexpected payment response',
  //         HttpStatus.INTERNAL_SERVER_ERROR
  //       );
  
  //     } catch (error) {
  //       // Handle specific API errors
  //       if (error.response?.data?.message?.includes('balance')) {
  //         await this.paymentRepository.update(payment.id, {
  //           status: PaymentStatus.FAILED,
  //           responseCode: 'BALANCE_ERROR',
  //           callbackPayload: error.response.data
  //         });
          
  //         throw new HttpException(
  //           'Failed to process payment, check your balance and try again',
  //           HttpStatus.BAD_REQUEST
  //         );
  //       }
  
  //       // Safely handle other axios errors and exceptions
  //       const errorPayload = {
  //         message: error.message,
  //         response: error.response?.data,
  //         stack: error.stack
  //       };
  
  //       await this.paymentRepository.update(payment.id, {
  //         status: PaymentStatus.FAILED,
  //         responseCode: 'ERROR',
  //         callbackPayload: errorPayload
  //       });
  
  //       throw new HttpException(
  //         error.response?.data?.message || 
  //         error.message || 
  //         'Payment processing encountered an unexpected error',
  //         error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
  //       );
  //     }
  //   } catch (error) {
  //     if (error instanceof HttpException) {
  //       throw error;
  //     }
  //     // Log unexpected errors
  //     console.error('Unexpected error in processPayment:', error);
  //     throw new HttpException(
  //       'Payment processing encountered an unexpected error',
  //       HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

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