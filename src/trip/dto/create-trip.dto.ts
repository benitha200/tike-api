import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Car } from 'src/car/entities/car.entity';
import { Driver } from 'src/driver/entities/driver.entity';
import { Location } from 'src/location/entities/location.entity';
import { Operator } from 'src/operator/entities/operator.entity';
import { InterceptDto } from 'src/shared/dto/intercept.dto';

export class CreateTripDto extends InterceptDto {
  @ApiProperty()
  @IsNotEmpty()
  idempotency_key: string;

  @ApiProperty()
  @IsNotEmpty()
  departure_location: Location;

  @ApiProperty()
  @IsNotEmpty()
  departure_time: Date;

  @ApiProperty()
  @IsNotEmpty()
  arrival_location: Location;

  @ApiProperty()
  @IsNotEmpty()
  arrival_time: Date;

  @ApiProperty()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  operator: Operator;

  @ApiProperty()
  @IsNotEmpty()
  car: Car;

  @ApiProperty()
  @IsNotEmpty()
  driver: Driver;
}
