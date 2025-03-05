import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { InterceptDto } from 'src/shared/dto/intercept.dto';

export class CreateOperatorDto extends InterceptDto {
  @ApiProperty()
  @IsNotEmpty()
  idempotency_key: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  logo_url?: string;

  @ApiPropertyOptional()
  website_url?: string;

  @ApiPropertyOptional()
  tin?: string;

  @ApiPropertyOptional()
  tax_inclusive?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  representative_name: string;

  @ApiProperty()
  @IsNotEmpty()
  representative_phone: string;

  @ApiPropertyOptional()
  representative_email?: string;

  @ApiProperty()
  @IsNotEmpty()
  support_phone: string;

  @ApiPropertyOptional()
  support_email?: string;
}
