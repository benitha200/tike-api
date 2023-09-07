import { ApiPropertyOptional } from '@nestjs/swagger';
import { InterceptDto } from 'src/shared/dto/intercept.dto';

export class UpdateOperatorDto extends InterceptDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  logo_url?: string;

  @ApiPropertyOptional()
  website_url?: string;

  @ApiPropertyOptional()
  tin?: string;

  @ApiPropertyOptional()
  tax_inclusive?: boolean;

  @ApiPropertyOptional()
  representative_name?: string;

  @ApiPropertyOptional()
  representative_phone?: string;

  @ApiPropertyOptional()
  representative_email?: string;

  @ApiPropertyOptional()
  support_phone?: string;

  @ApiPropertyOptional()
  support_email?: string;
}
