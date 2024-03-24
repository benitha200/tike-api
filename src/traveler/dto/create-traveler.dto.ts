import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { InterceptDto } from 'src/shared/dto/intercept.dto';

export class CreateTravelerDTO extends InterceptDto {
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

  @ApiProperty()
  @IsNotEmpty()
  tax_id: string;

  @ApiProperty()
  @IsNotEmpty()
  emergency_contact_name: string;

  @ApiProperty()
  @IsNotEmpty()
  emergency_contact_email: string;

  @ApiProperty()
  @IsNotEmpty()
  emergency_contact_phone_number: string;

  @ApiProperty()
  @IsNotEmpty()
  bookings: [];
}
