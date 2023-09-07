import { ApiPropertyOptional } from '@nestjs/swagger';
import { InterceptDto } from 'src/shared/dto/intercept.dto';

export class UpdateCarDto extends InterceptDto {
  @ApiPropertyOptional()
  car_no?: string;

  @ApiPropertyOptional()
  immatriculation_no?: string;

  @ApiPropertyOptional()
  brand?: string;

  @ApiPropertyOptional()
  model?: string;

  @ApiPropertyOptional()
  type?: string;
}
