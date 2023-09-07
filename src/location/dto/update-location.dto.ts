import { ApiPropertyOptional } from '@nestjs/swagger';
import { InterceptDto } from 'src/shared/dto/intercept.dto';

export class UpdateLocationDto extends InterceptDto {
  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  city: string;

  @ApiPropertyOptional()
  country: string;
}
