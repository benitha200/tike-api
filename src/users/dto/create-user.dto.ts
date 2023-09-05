import { IsNotEmpty } from 'class-validator';
import { InterceptDto } from 'src/shared/dto/intercept.dto';

export class CreateUserDto extends InterceptDto {
  @IsNotEmpty()
  idempotency_key: string;

  @IsNotEmpty()
  fullname: string;

  @IsNotEmpty()
  identifier: string;

  @IsNotEmpty()
  password: string;
}
