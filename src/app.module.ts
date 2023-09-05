import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LocalAuthGuard } from './auth/utils/local-auth.guard';
import appConfig from './shared/config/app.config';
import authConfig from './shared/config/auth.config';
import { databaseConfig } from './shared/config/database.config';
import { UsersModule } from './users/users.module';
import { OperatorModule } from './operator/operator.module';
import { CarModule } from './car/car.module';
import { DriverModule } from './driver/driver.module';
import { LocationModule } from './location/location.module';
import { TripModule } from './trip/trip.module';
import { TravelerModule } from './traveler/traveler.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig],
      envFilePath: ['.env'],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get('auth.secret'),
        signOptions: { expiresIn: configService.get('auth.expires') },
      }),
    }),
    TypeOrmModule.forRoot(databaseConfig),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    AuthModule,
    UsersModule,
    OperatorModule,
    CarModule,
    DriverModule,
    LocationModule,
    TripModule,
    TravelerModule,
    BookingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: LocalAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
