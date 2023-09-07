import { ApiPropertyOptional } from '@nestjs/swagger';
import { InterceptDto } from 'src/shared/dto/intercept.dto';

export class UpdateDriverDto extends InterceptDto {
  @ApiPropertyOptional()
  fullname?: string;

  @ApiPropertyOptional()
  nationality?: string;

  @ApiPropertyOptional()
  dob?: string;

  @ApiPropertyOptional()
  gender?: string;

  @ApiPropertyOptional()
  phone_number?: string;

  @ApiPropertyOptional()
  emergency_contact_name?: string;

  @ApiPropertyOptional()
  emergency_contact_email?: string;

  @ApiPropertyOptional()
  emergency_contact_phone_number?: string;
}
