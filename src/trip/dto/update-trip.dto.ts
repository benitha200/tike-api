import { ApiPropertyOptional } from '@nestjs/swagger';
import { Car } from 'src/car/entities/car.entity';
import { Driver } from 'src/driver/entities/driver.entity';
import { Location } from 'src/location/entities/location.entity';
import { Operator } from 'src/operator/entities/operator.entity';
import { InterceptDto } from 'src/shared/dto/intercept.dto';

export class UpdateTripDto extends InterceptDto {
  @ApiPropertyOptional()
  departure_location: Location;

  @ApiPropertyOptional()
  departure_time: Date;

  @ApiPropertyOptional()
  arrival_location: Location;

  @ApiPropertyOptional()
  arrival_time: Date;

  @ApiPropertyOptional()
  price: number;

  @ApiPropertyOptional()
  operator?: Operator;

  @ApiPropertyOptional()
  car?: Car;

  @ApiPropertyOptional()
  driver?: Driver;
}
