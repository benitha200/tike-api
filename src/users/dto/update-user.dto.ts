import { ApiPropertyOptional } from '@nestjs/swagger';
import { InterceptDto } from 'src/shared/dto/intercept.dto';

export class UpdateUserDto extends InterceptDto {
  @ApiPropertyOptional()
  fullname?: string;

  @ApiPropertyOptional()
  identifier?: string;

  @ApiPropertyOptional()
  picture?: string;

  @ApiPropertyOptional()
  dob?: Date;

  @ApiPropertyOptional()
  gender?: string;

  @ApiPropertyOptional()
  picture_url?: string;

  @ApiPropertyOptional()
  level?: string;
}
