import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { InterceptDto } from 'src/shared/dto/intercept.dto';

export class CreateTravelerDTO extends InterceptDto {
  @ApiProperty()
  @IsNotEmpty()
  idempotency_key: string;

  @ApiProperty()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty()
  @IsNotEmpty()
  nationality: string;

  @ApiProperty()
  @IsNotEmpty()
  dob: string;

  @ApiProperty()
  @IsNotEmpty()
  gender: string;

  @ApiProperty()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional()
  tax_id: string;

  @ApiPropertyOptional()
  emergency_contact_name: string;

  @ApiPropertyOptional()
  emergency_contact_email: string;

  @ApiPropertyOptional()
  emergency_contact_phone_number: string;

  @ApiPropertyOptional()
  bookings: [];
}
