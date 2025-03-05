import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { InterceptDto } from 'src/shared/dto/intercept.dto';

export class CreateDriverDto extends InterceptDto {
  @ApiProperty()
  @IsNotEmpty()
  idempotency_key: string;

  @ApiProperty()
  @IsNotEmpty()
  fullname: string;

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
