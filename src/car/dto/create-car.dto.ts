import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { InterceptDto } from 'src/shared/dto/intercept.dto';

export class CreateCarDto extends InterceptDto {
  @ApiProperty()
  @IsNotEmpty()
  idempotency_key: string;

  @ApiProperty()
  @IsNotEmpty()
  car_no: string;

  @ApiProperty()
  @IsNotEmpty()
  immatriculation_no: string;

  
  @ApiProperty()
  @IsNotEmpty()
  number_of_seats: number;



  @ApiProperty()
  @IsNotEmpty()
  brand: string;

  @ApiProperty()
  @IsNotEmpty()
  model: string;

  @ApiProperty()
  @IsNotEmpty()
  type: string;
}
