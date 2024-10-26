// import { Controller, Post, Body, Param, HttpStatus, HttpException } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
// import { PAYMENT_ROUTES } from './routes';
// import { PaymentService } from './payment.service';
// import { PaymentRequestDto } from './dto/payment.dto';
// import { IntouchCallbackDto } from './dto/callback.dto';
// import { IntouchCallback } from './payment.interface';
// // import { PaymentService } from '../services/payment.service';
// // import { IntouchCallback } from '../interfaces/payment.interface';
// // import { PaymentRequestDto } from '../dto/payment.dto';
// // import { IntouchCallbackDto } from '../dto/callback.dto';
// // import { PAYMENT_ROUTES } from '../routes/routes';

// @ApiTags('Payments')
// @Controller(PAYMENT_ROUTES.BASE)
// export class PaymentController {
//   constructor(private paymentService: PaymentService) {}

//   @Post(PAYMENT_ROUTES.PROCESS)
//   @ApiOperation({ summary: 'Process a new payment' })
//   @ApiResponse({ status: HttpStatus.OK, description: 'Payment processed successfully' })
//   @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid payment data' })
//   @ApiBody({ type: PaymentRequestDto })
//   async processPayment(
//     @Param('bookingId') bookingId: string,
//     @Body() paymentData: { amount: number; phoneNumber: string },
//   ) {
//     try {
//       return await this.paymentService.processPayment(
//         bookingId,
//         paymentData.amount,
//         paymentData.phoneNumber,
//       );
//     } catch (error) {
//       throw new HttpException(
//         'Payment processing failed',
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//   }

//   @Post(PAYMENT_ROUTES.CALLBACK)
//   @ApiOperation({ summary: 'Handle payment callback' })
//   @ApiResponse({ status: HttpStatus.OK, description: 'Callback processed successfully' })
//   @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid callback data' })
//   @ApiBody({ type: IntouchCallbackDto }) // Using the DTO instead of interface
//   async handleCallback(@Body() callback: IntouchCallback) {
//     try {
//       await this.paymentService.handlePaymentCallback(callback);
//       return { message: 'Callback processed successfully' };
//     } catch (error) {
//       throw new HttpException(
//         'Callback processing failed',
//         HttpStatus.BAD_REQUEST,
//       );
//     }
//   }
// }

// import { 
//     Controller, 
//     Post, 
//     Get, 
//     Body, 
//     Param, 
//     HttpStatus, 
//     HttpException,
//     Patch,
//     Delete
//   } from '@nestjs/common';
//   import { 
//     ApiTags, 
//     ApiOperation, 
//     ApiResponse, 
//     ApiBody,
//     ApiCreatedResponse,
//     ApiForbiddenResponse,
//     ApiBadRequestResponse,
//     ApiOkResponse,
// } from '@nestjs/swagger';
//   import { HttpCode } from '@nestjs/common';
//   import { PaymentService } from './payment.service';
//   import { Payment } from './entities/payment.entity';
//   import { CreatePaymentDto } from './dto/create-payment.dto';
//   import { UpdatePaymentDto } from './dto/update-payment.dto';
//   import { InterceptDto } from '../shared/dto/intercept.dto';
//   import { Public } from '../auth/utils/local-auth.decorator';
  
//   @ApiTags('Payments')
//   @Controller('payments')
//   export class PaymentController {
//     constructor(private readonly paymentService: PaymentService) {}
  
//     @ApiCreatedResponse({ type: Payment })
//     @ApiForbiddenResponse({ description: 'Forbidden' })
//     @ApiBadRequestResponse({ description: 'Bad Request' })
//     @Post()
//     async create(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
//       return this.paymentService.create(createPaymentDto);
//     }
  
//     @Public()
//     @ApiOkResponse({ type: Payment, isArray: true })
//     @ApiForbiddenResponse({ description: 'Forbidden' })
//     @ApiBadRequestResponse({ description: 'Bad Request' })
//     @Get()
//     async findAll(@Body() intercept: InterceptDto): Promise<Payment[]> {
//       return this.paymentService.findAll(intercept);
//     }
  
//     @ApiOkResponse({ type: Payment })
//     @ApiForbiddenResponse({ description: 'Forbidden' })
//     @ApiBadRequestResponse({ description: 'Bad Request' })
//     @Get(':id')
//     async findOne(
//       @Param('id') id: string,
//       @Body() intercept: InterceptDto,
//     ): Promise<Payment> {
//       return this.paymentService.findOne(id, intercept);
//     }
  
//     @ApiOkResponse({ type: Payment })
//     @ApiForbiddenResponse({ description: 'Forbidden' })
//     @ApiBadRequestResponse({ description: 'Bad Request' })
//     @HttpCode(HttpStatus.OK)
//     @Post('process/:bookingId')
//     async processPayment(
//       @Param('bookingId') bookingId: string,
//       @Body() paymentData: { amount: number; phoneNumber: string },
//     ): Promise<Payment> {
//       return this.paymentService.processPayment(
//         bookingId,
//         paymentData.amount,
//         paymentData.phoneNumber,
//       );
//     }
  
//     @ApiOkResponse({ type: Payment })
//     @ApiForbiddenResponse({ description: 'Forbidden' })
//     @ApiBadRequestResponse({ description: 'Bad Request' })
//     @Patch(':id')
//     async update(
//       @Param('id') id: string,
//       @Body() updatePaymentDto: UpdatePaymentDto,
//     ): Promise<Payment> {
//       return this.paymentService.update(id, updatePaymentDto);
//     }
  
//     @ApiOkResponse({ type: Payment })
//     @ApiForbiddenResponse({ description: 'Forbidden' })
//     @ApiBadRequestResponse({ description: 'Bad Request' })
//     @Delete(':id')
//     async remove(
//       @Param('id') id: string,
//       @Body() intercept: InterceptDto,
//     ): Promise<Payment> {
//       return this.paymentService.remove(id, intercept);
//     }
//   }


import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InterceptDto } from '../shared/dto/intercept.dto';
import { Public } from '../auth/utils/local-auth.decorator';
import { IntouchCallback } from './payment.interface';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiCreatedResponse({ type: Payment })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentService.create(createPaymentDto);
  }

  @Public()
  @ApiOkResponse({ type: Payment, isArray: true })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Get()
  async findAll(@Body() intercept: InterceptDto): Promise<Payment[]> {
    return this.paymentService.findAll(intercept);
  }

  @ApiOkResponse({ type: Payment })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Payment> {
    return this.paymentService.findOne(id);
  }

  @ApiOkResponse({ type: Payment })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Post('process/:bookingId')
  @HttpCode(HttpStatus.OK)
  async processPayment(
    @Param('bookingId') bookingId: string,
    @Body() paymentData: { amount: number; phoneNumber: string },
  ): Promise<Payment> {
    return this.paymentService.processPayment(
      bookingId,
      paymentData.amount,
      paymentData.phoneNumber,
    );
  }

  @Public()
  @Post('callback')
  @HttpCode(HttpStatus.OK)
  async handleCallback(@Body() callback: IntouchCallback): Promise<void> {
    return this.paymentService.handlePaymentCallback(callback);
  }

  @ApiOkResponse({ type: Payment })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @ApiOkResponse({ type: Payment })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.paymentService.remove(id);
  }
}
