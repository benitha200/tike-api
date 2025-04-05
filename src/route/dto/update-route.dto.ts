import { IsOptional, IsString, IsUUID, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateRouteStopDto {
  @IsString()
  stopName: string;

  @IsNumber()
  stopOrder: number;

  @IsNumber()
  @Min(0)
  duration: number;

  @IsNumber()
  @Min(0)
  price: number;
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRouteStopDto)
  routeStops?: UpdateRouteStopDto[];
}
