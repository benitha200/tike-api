import { IsString, IsUUID, ValidateNested, IsArray, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class RouteStopDto {
  @IsString()
  stopName: string;

  @IsNumber()
  @Min(1)
  stopOrder: number;

  @IsNumber()
  duration: number;

  @IsNumber()
  price: number;
}

export class CreateRouteDto {
  @IsString()
  name: string;

  @IsUUID()
  departure_location: string;

  @IsUUID()
  arrival_location: string;

  @IsString()
  idempotency_key: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  routeStops: RouteStopDto[];
}
