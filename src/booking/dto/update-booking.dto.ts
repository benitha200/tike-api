import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { InterceptDto } from 'src/shared/dto/intercept.dto';
import { Traveler } from 'src/traveler/entities/traveler.entity';
import { Trip } from 'src/trip/entities/trip.entity';

export class UpdateBookingDto extends InterceptDto {
  @ApiPropertyOptional()
  is_one_way?: boolean;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  trip?: Trip;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  trip_date?: string; 

  @ApiPropertyOptional()
  traveler?: Traveler;

  @ApiPropertyOptional()
  payment_status?: 'PENDING' | 'PAID' | 'FAILED';

  @ApiPropertyOptional()
  payment_reference?: string;

  @ApiPropertyOptional()
  seat_number?: string;
}