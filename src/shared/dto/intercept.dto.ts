import { ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';

export class InterceptDto {
  @ApiPropertyOptional()
  id?: string;

  @ApiPropertyOptional()
  user?: User;
}
