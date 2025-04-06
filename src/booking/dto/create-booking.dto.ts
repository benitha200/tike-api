// create-booking.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString } from 'class-validator';
import { InterceptDto } from 'src/shared/dto/intercept.dto';
import { Traveler } from 'src/traveler/entities/traveler.entity';
import { Trip } from 'src/trip/entities/trip.entity';
import { Route } from 'src/route/entities/routes.entity';
import { RouteStop } from 'src/route-stop/entities/route-stop.entity';

export class CreateBookingDto extends InterceptDto {
  @ApiProperty()
  @IsNotEmpty()
  idempotency_key: string;

  @ApiProperty()
  @IsNotEmpty()
  is_one_way: boolean;

  @ApiPropertyOptional()
  notes: string;

  @ApiProperty()
  @IsNotEmpty()
  trip: Trip;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  trip_date: string; // Changed to string type for ISO date format

  @ApiProperty()
  @IsNotEmpty()
  traveler: Traveler;

  @ApiProperty()
  @IsNotEmpty()
  instop: string;

  @ApiProperty()
  @IsNotEmpty()
  outstop: string;

  @ApiPropertyOptional()
  payment_status: string;

  @ApiPropertyOptional()
  payment_reference: string;

  @ApiPropertyOptional()
  seat_number?: string;
}
