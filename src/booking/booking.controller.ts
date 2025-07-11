import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InterceptDto } from 'src/shared/dto/intercept.dto';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './entities/booking.entity';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @ApiCreatedResponse({ type: Booking })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Post()
  async create(@Body() payload: CreateBookingDto): Promise<Booking> {
    return await this.bookingService.create(payload);
  }

  @ApiOkResponse({ type: Booking, isArray: true })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Get()
  async findAll(
    @Query('traveler') traveler: string,
    @Body() intercept: InterceptDto,
  ): Promise<Booking[]> {
    return await this.bookingService.findAll(traveler, intercept);
  }

  @ApiOkResponse({ type: Booking })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Body() intercept: InterceptDto,
  ): Promise<Booking> {
    return await this.bookingService.findOne(id, intercept);
  }

  @ApiOkResponse({ type: 'string' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Patch(':id/cancel')
  async update(
    @Param('id') id: string,
    @Body() intercept: InterceptDto,
  ): Promise<string> {
    return await this.bookingService.cancel(id, intercept);
  }
  @ApiOkResponse({ type: Booking })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @Patch(':id/payment')
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto
    ,
  ): Promise<Booking> {
    return await this.bookingService.updatePaymentStatus(id, updateBookingDto.payment_status);
  }

//   @Get('seats/:tripId')
//   async getAvailableSeats(
//     @Param('tripId') tripId: string,
//     @Query('date') date: string,
//   ) {
//     const seatData = await this.bookingService.getAvailableSeats(tripId, date);
    
//     return {
//       payload: {
//         total: seatData.total,
//         available: seatData.available,
//         booked: seatData.booked,
//         paymentStatus: seatData.paymentStatus
//       },
//       metadata: {
//         statusCode: 200,
//         message: ['Success'],
//       },
//       path: `/bookings/seats/${tripId}`,
//       timestamp: new Date().toISOString(),
//     };
//   }
// }

@Get('seats/:tripId')
  @ApiOperation({ summary: 'Get available seats for a trip on a specific date' })
  @ApiResponse({ status: 200, description: 'Returns seat availability data' })
  async getAvailableSeats(
    @Param('tripId') tripId: string,
    @Query('date') date: string,
    @Query('instopid') inStopId: string,
    @Query('outstopid') outStopId: string,
  ) {
    console.log('tripId:', tripId);
    
    const seatData = await this.bookingService.getAvailableSeats(tripId, date, inStopId, outStopId);

    return {
      payload: {
        total: seatData.total,
        available: seatData.available,
        booked: seatData.booked,
        paymentStatus: seatData.paymentStatus
      },
      metadata: {
        statusCode: 200,
        message: ['Success'],
      },
      path: `/bookings/seats/${tripId}`,
      timestamp: new Date().toISOString(),
    };
  }

  @ApiOkResponse({ type: Booking, isArray: true })
  @ApiOperation({ summary: 'Get bookings by traveler phone number' })
  @Get('/check-ticket/:phone')
  async getBookingsByPhone(@Param('phone') phone: string) {
    return await this.bookingService.findByTravelerPhone(phone);
  }
}
