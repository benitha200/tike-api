import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface Response<T> {}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((payload) => ({
        payload: payload || null,
        metadata: { statusCode: 200, message: ['Success'] },
        path: request.route.path,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
