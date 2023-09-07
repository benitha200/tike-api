import { ApiPropertyOptional } from '@nestjs/swagger';
import { InterceptDto } from 'src/shared/dto/intercept.dto';

export class UpdateUserDto extends InterceptDto {
  @ApiPropertyOptional()
  fullname?: string;

  @ApiPropertyOptional()
  identifier?: string;

  @ApiPropertyOptional()
  password?: string;

  @ApiPropertyOptional()
  nationality?: string;

  @ApiPropertyOptional()
  dob?: string;

  @ApiPropertyOptional()
  gender?: string;

  @ApiPropertyOptional()
  phone_number?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  tax_id?: string;

  @ApiPropertyOptional()
  emergency_contact_name?: string;

  @ApiPropertyOptional()
  emergency_contact_email?: string;

  @ApiPropertyOptional()
  emergency_contact_phone_number?: string;

  @ApiPropertyOptional()
  operator_code?: string;
}
