import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';

export class AuthResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  user: User;
}
