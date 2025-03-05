// import {
//   ClassSerializerInterceptor,
//   VERSION_NEUTRAL,
//   ValidationPipe,
//   VersioningType,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { NestFactory, Reflector } from '@nestjs/core';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import helmet from 'helmet';
// import { AppModule } from './app.module';
// import { HttpExceptionFilter } from './shared/utils/exception.filter';
// import { ResponseInterceptor } from './shared/utils/response.interceptor';
// import { UserInterceptor } from './shared/utils/user.interceptor';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   const configService = app.get(ConfigService);
//   const port = configService.get('app.port');

//   app.use(helmet());
//   // app.enableCors();
//   app.useGlobalPipes(new ValidationPipe({ transform: true }));
//   app.useGlobalFilters(new HttpExceptionFilter());
//   app.useGlobalInterceptors(new UserInterceptor());
//   app.useGlobalInterceptors(new ResponseInterceptor());
//   app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
//   app.enableVersioning({
//     type: VersioningType.HEADER,
//     header: 'Version',
//     defaultVersion: VERSION_NEUTRAL,
//   });

//   const config = new DocumentBuilder()
//     .setTitle('Tike')
//     .setDescription('This is Tike API Documentation')
//     .setVersion('1.0')
//     .build();
//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('documentation', app, document);

//   await app.listen(3000);
// }
// bootstrap();

// import {
//   ClassSerializerInterceptor,
//   VERSION_NEUTRAL,
//   ValidationPipe,
//   VersioningType,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { NestFactory, Reflector } from '@nestjs/core';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import helmet from 'helmet';
// import { AppModule } from './app.module';
// import { HttpExceptionFilter } from './shared/utils/exception.filter';
// import { ResponseInterceptor } from './shared/utils/response.interceptor';
// import { UserInterceptor } from './shared/utils/user.interceptor';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   const configService = app.get(ConfigService);
//   const port = configService.get('app.port');

//   app.use(helmet());
  
//   // Enable and configure CORS for multiple origins
//   app.enableCors({
//     origin: ['http://localhost:3000','http://localhost:3001', 'http://localhost:3002','https://49ac-2c0f-eb68-625-c000-b86a-612f-850-9b3.ngrok-free.app'], // Allow these origins
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed methods
//     credentials: true, // Allow credentials (cookies, authorization headers, etc.)
//   });

//   app.useGlobalPipes(new ValidationPipe({ transform: true }));
//   app.useGlobalFilters(new HttpExceptionFilter());
//   app.useGlobalInterceptors(new UserInterceptor());
//   app.useGlobalInterceptors(new ResponseInterceptor());
//   app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
//   app.enableVersioning({
//     type: VersioningType.HEADER,
//     header: 'Version',
//     defaultVersion: VERSION_NEUTRAL,
//   });

//   const config = new DocumentBuilder()
//     .setTitle('Tike')
//     .setDescription('This is Tike API Documentation')
//     .setVersion('1.0')
//     .build();
//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('documentation', app, document);

//   await app.listen(3010);
// }
// bootstrap();

import {
  ClassSerializerInterceptor,
  VERSION_NEUTRAL,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/utils/exception.filter';
import { ResponseInterceptor } from './shared/utils/response.interceptor';
import { UserInterceptor } from './shared/utils/user.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('app.port');

  app.use(helmet());

  // Enable and configure CORS for multiple origins
  app.enableCors(
  // {
  //   origin: [
  //     'http://localhost:3000',
  //     'http://localhost:3001',
  //     'http://localhost:3002',
  //     'http://localhost:3011',
  //     'https://55f5-2c0f-eb68-625-c000-f497-b2a9-4198-66da.ngrok-free.app/',
  //     'https://7877-105-179-7-106.ngrok-free.app',
  //     'http://localhost:3010',
  //     'https://operator.tike.rw'
  //   ], // Allow these origins
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed methods
  //   credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  // }
);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new UserInterceptor());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.enableVersioning({
    type: VersioningType.HEADER,
    header: 'Version',
    defaultVersion: VERSION_NEUTRAL,
  });

  const config = new DocumentBuilder()
    .setTitle('Tike')
    .setDescription('This is Tike API Documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);

  await app.listen(3010);
}
bootstrap();
