import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Location as Stop } from 'src/location/entities/location.entity';  // Import the Stop model

export class CreateRouteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  idempotency_key: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: () => Stop })
  @IsNotEmpty()
  @IsUUID() // Ensures the ID is a valid UUID
  originStop: Stop;

  @ApiProperty({ type: () => Stop })
  @IsNotEmpty()
  @IsUUID() // Ensures the ID is a valid UUID
  terminalStop: Stop;
}
