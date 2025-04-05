import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Car } from 'src/car/entities/car.entity';
import { Driver } from 'src/driver/entities/driver.entity';
import { Operator } from 'src/operator/entities/operator.entity';
import { Route } from 'src/route/entities/routes.entity';
import { InterceptDto } from 'src/shared/dto/intercept.dto';

export class CreateTripDto extends InterceptDto {
  @ApiProperty()
  @IsNotEmpty()
  idempotency_key: string;

  // Instead of departure_location and arrival_location, reference the route
  @ApiProperty()
  @IsNotEmpty()
  route: Route; // Link to Route entity which provides departure_location, arrival_location, and price

  @ApiProperty()
  @IsNotEmpty()
  departure_time: String;

  @ApiProperty()
  @IsNotEmpty()
  arrival_time: String;

  @ApiProperty()
  @IsNotEmpty()
  total_seats: number;

  // Removed price, it will be fetched from the Route entity
  // price: number;

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
