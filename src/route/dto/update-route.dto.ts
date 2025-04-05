import { IsOptional, IsString, IsUUID, IsArray, ValidateNested, IsNumber, Min, isNumber } from 'class-validator';
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
    

  idempotency_key: string;
  
  }
export class UpdateRouteDto {

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  departure_location?: string;

  @IsOptional()
  @IsUUID()
  arrival_location?: string;

  @IsNumber()
 total_price: number;

  @IsNumber()
  total_duration: number; // Total duration in minutes

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  routeStops?: RouteStopDto[];
}
