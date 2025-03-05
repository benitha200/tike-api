import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor() {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    request.body['user'] = user;

    return next.handle();
  }
}
