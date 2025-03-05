import { LoggerService } from '@nestjs/common';

export class ConsoleLogger implements LoggerService {
  log(message: any, ...optionalParams: any[]) {
    console.log(message);
  }
  error(message: any, ...optionalParams: any[]) {
    console.error(message);
  }
  warn(message: any, ...optionalParams: any[]) {
    console.warn(message);
  }
  debug?(message: any, ...optionalParams: any[]) {
    console.debug(message);
  }
  verbose?(message: any, ...optionalParams: any[]) {
    console.log(message);
  }
}
