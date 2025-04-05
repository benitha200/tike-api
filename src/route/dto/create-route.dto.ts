import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Location } from 'src/location/entities/location.entity';  // Import the Stop model

export class CreateRouteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  idempotency_key: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: () => Location })
  @IsNotEmpty()
  @IsUUID() // Ensures the ID is a valid UUID
  departure_location: Location;

  @ApiProperty({ type: () => Location })
  @IsNotEmpty()
  @IsUUID() // Ensures the ID is a valid UUID
  arrival_location: Location;
}
