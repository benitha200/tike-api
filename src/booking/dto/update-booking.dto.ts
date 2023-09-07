import { ApiPropertyOptional } from '@nestjs/swagger';
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
  traveler?: Traveler;
}
