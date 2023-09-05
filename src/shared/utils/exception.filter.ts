import { ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const errors = exception.getResponse();

    let formattedError = null;
    if (errors['statusCode'] === undefined) {
      formattedError = {
        statusCode: status,
        message: [errors],
      };
    }

    response.status(status).json({
      payload: null,
      metaData: formattedError != null ? formattedError : errors,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
