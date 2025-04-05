import { ApiPropertyOptional } from '@nestjs/swagger';
import { Car } from 'src/car/entities/car.entity';
import { Driver } from 'src/driver/entities/driver.entity';
import { Operator } from 'src/operator/entities/operator.entity';
import { InterceptDto } from 'src/shared/dto/intercept.dto';
import { Route } from 'src/route/entities/routes.entity';

export class UpdateTripDto extends InterceptDto {
  @ApiPropertyOptional()
  route: Route;  // Instead of direct location and price, we'll use a route entity.

  @ApiPropertyOptional()
  departure_time: String;

  @ApiPropertyOptional()
  arrival_time: String;

  @ApiPropertyOptional()
  total_seats: number;

  @ApiPropertyOptional()
  operator?: Operator;

  @ApiPropertyOptional()
  car?: Car;

  @ApiPropertyOptional()
  driver?: Driver;

  @ApiPropertyOptional()
  is_daily?: boolean;
}
