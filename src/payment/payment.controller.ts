// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   Patch,
//   Post,
//   HttpStatus,
//   HttpCode,
// } from '@nestjs/common';
// import {
//   ApiBadRequestResponse,
//   ApiCreatedResponse,
//   ApiForbiddenResponse,
//   ApiOkResponse,
//   ApiTags,
//   ApiOperation,
//   ApiParam,
//   ApiBody,
// } from '@nestjs/swagger';
// import { Payment } from './entities/payment.entity';
// import { PaymentService } from './payment.service';
// import { CreatePaymentDto } from './dto/create-payment.dto';
// import { UpdatePaymentDto } from './dto/update-payment.dto';
// import { InterceptDto } from '../shared/dto/intercept.dto';
// import { Public } from '../auth/utils/local-auth.decorator';
// import { IntouchCallback } from './payment.interface';

// @ApiTags('Payments')
// @Controller('payments')
// export class PaymentController {
//   constructor(private readonly paymentService: PaymentService) {}

//   @ApiCreatedResponse({ type: Payment })
//   @ApiForbiddenResponse({ description: 'Forbidden' })
//   @ApiBadRequestResponse({ description: 'Bad Request' })
//   @ApiOperation({ summary: 'Create a new payment record' })
//   @Post()
//   async create(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
//     return this.paymentService.create(createPaymentDto);
//   }

//   @Public()
//   @ApiOkResponse({ type: Payment, isArray: true })
//   @ApiForbiddenResponse({ description: 'Forbidden' })
//   @ApiBadRequestResponse({ description: 'Bad Request' })
//   @ApiOperation({ summary: 'Get all payments' })
//   @Get()
//   async findAll(@Body() intercept: InterceptDto): Promise<Payment[]> {
//     return this.paymentService.findAll(intercept);
//   }

//   @ApiOkResponse({ type: Payment })
//   @ApiForbiddenResponse({ description: 'Forbidden' })
//   @ApiBadRequestResponse({ description: 'Bad Request' })
//   @ApiOperation({ summary: 'Get payment by ID' })
//   @ApiParam({ name: 'id', description: 'Payment ID' })
//   @Get(':id')
//   async findOne(@Param('id') id: string): Promise<Payment> {
//     return this.paymentService.findOne(id);
//   }

//   @ApiOkResponse({
//     schema: {
//       type: 'object',
//       properties: {
//         payment: { type: 'object', $ref: '#/components/schemas/Payment' },
//         intouchResponse: { type: 'object', nullable: true }
//       }
//     }
//   })
//   @ApiForbiddenResponse({ description: 'Forbidden' })
//   @ApiBadRequestResponse({ description: 'Bad Request' })
//   @ApiOperation({ summary: 'Process a new payment for a booking' })
//   @ApiParam({ name: 'bookingId', description: 'Booking ID' })
//   @ApiBody({
//     schema: {
//       type: 'object',
//       required: ['amount', 'phoneNumber'],
//       properties: {
//         amount: {
//           type: 'number',
//           description: 'Payment amount',
//           example: 1000
//         },
//         phoneNumber: {
//           type: 'string',
//           description: 'Customer phone number',
//           example: '+254712345678'
//         }
//       }
//     }
//   })
//   @Post('process/:bookingId')
//   @HttpCode(HttpStatus.OK)
//   async processPayment(
//     @Param('bookingId') bookingId: string,
//     @Body() paymentData: { amount: number; phoneNumber: string },
//   ): Promise<{ payment: Payment; intouchResponse?: any }> {
//     return this.paymentService.processPayment(
//       bookingId,
//       paymentData.amount,
//       paymentData.phoneNumber,
//     );
//   }

//   @Public()
//   @ApiOperation({ summary: 'Handle payment callback from payment provider' })
//   @ApiBadRequestResponse({ description: 'Invalid callback data' })
//   @ApiBody({
//     schema: {
//       type: 'object',
//       required: ['jsonpayload'],
//       properties: {
//         jsonpayload: {
//           type: 'object',
//           required: ['requesttransactionid', 'status', 'responsecode'],
//           properties: {
//             requesttransactionid: { type: 'string' },
//             status: { type: 'string' },
//             responsecode: { type: 'string' }
//           }
//         }
//       }
//     }
//   })
//   @Post('callback')
//   @HttpCode(HttpStatus.OK)
//   async handleCallback(@Body() callback: IntouchCallback): Promise<void> {
//     return this.paymentService.handlePaymentCallback(callback);
//   }

//   @ApiOkResponse({ type: Payment })
//   @ApiForbiddenResponse({ description: 'Forbidden' })
//   @ApiBadRequestResponse({ description: 'Bad Request' })
//   @ApiOperation({ summary: 'Update payment details' })
//   @ApiParam({ name: 'id', description: 'Payment ID' })
//   @Patch(':id')
//   async update(
//     @Param('id') id: string,
//     @Body() updatePaymentDto: UpdatePaymentDto,
//   ): Promise<Payment> {
//     return this.paymentService.update(id, updatePaymentDto);
//   }

//   @ApiOkResponse({ description: 'Payment successfully deleted' })
//   @ApiForbiddenResponse({ description: 'Forbidden' })
//   @ApiBadRequestResponse({ description: 'Bad Request' })
//   @ApiOperation({ summary: 'Delete a payment' })
//   @ApiParam({ name: 'id', description: 'Payment ID' })
//   @Delete(':id')
//   @HttpCode(HttpStatus.NO_CONTENT)
//   async remove(@Param('id') id: string): Promise<void> {
//     return this.paymentService.remove(id);
//   }
// }

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
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InterceptDto } from '../shared/dto/intercept.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiCreatedResponse({ type: Payment })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Create a new payment record' })
  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentService.create(createPaymentDto);
  }

  @ApiOkResponse({ type: Payment, isArray: true })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get all payments' })
  @Get()
  async findAll(@Body() intercept: InterceptDto): Promise<Payment[]> {
    return this.paymentService.findAll(intercept);
  }

  @ApiOkResponse({ type: Payment })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Payment> {
    return this.paymentService.findOne(id);
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        payment: { type: 'object', $ref: '#/components/schemas/Payment' },
        itechpayResponse: { type: 'object', nullable: true }
      }
    }
  })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Process a new payment for a booking via Itechpay' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['amount', 'phoneNumber'],
      properties: {
        amount: {
          type: 'number',
          description: 'Payment amount',
          example: 10
        },
        phoneNumber: {
          type: 'string',
          description: 'Customer phone number (MTN or Airtel)',
          example: '0798760888'
        }
      }
    }
  })
  @Post('process/:bookingId')
  @HttpCode(HttpStatus.OK)
  async processPayment(
    @Param('bookingId') bookingId: string,
    @Body() paymentData: { amount: number; phoneNumber: string },
  ): Promise<{ payment: Payment; itechpayResponse?: any }> {
    return this.paymentService.processPayment(
      bookingId,
      paymentData.amount,
      paymentData.phoneNumber,
    );
  }

  @ApiOkResponse({ type: Payment })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Update payment details' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @ApiOkResponse({ description: 'Payment successfully deleted' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOperation({ summary: 'Delete a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.paymentService.remove(id);
  }

  @ApiOkResponse({
    description: 'Payment status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['pending', 'success', 'failed', 'not_found', 'unknown'] 
        },
        payload: { type: 'object' },
        metaData: { 
          type: 'object',
          properties: {
            message: { type: 'array', items: { type: 'string' } },
            payment: { type: 'object' }
          }
        }
      }
    }
  })
  
  @ApiOperation({ summary: 'Check payment status for a booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID to check payment status' })
  @Get('status/:bookingId')
  async checkPaymentStatus(
    @Param('bookingId') bookingId: string
  ): Promise<{ 
    status: string; 
    payload?: any; 
    metaData?: any 
  }> {
    const result = await this.paymentService.checkPaymentStatus(bookingId);
    
    return {
      status: 'success',
      payload: result,
      metaData: result.metaData
    };
  }
}