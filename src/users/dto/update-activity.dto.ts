import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { InterceptDto } from 'src/shared/dto/intercept.dto';

export class UpdateActivityDto extends InterceptDto {
  @ApiProperty()
  @IsNotEmpty()
  idempotency_key: string;

  @ApiProperty()
  @IsNotEmpty()
  book: string;

  @IsNotEmpty()
  @IsNotEmpty()
  time_read: number;

  @ApiProperty()
  @IsNotEmpty()
  activity_end_page: number;
}
