// import { Module } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { JwtModule } from '@nestjs/jwt';
// import { PassportModule } from '@nestjs/passport';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Operator } from 'src/operator/entities/operator.entity';
// import { Token } from 'src/shared/entities/token.entity';
// import { Traveler } from 'src/traveler/entities/traveler.entity';
// import { User } from 'src/users/entities/user.entity';
// import { UsersModule } from 'src/users/users.module';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { LocalAuthStrategy } from './utils/local-auth.strategy';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([User, Token, Traveler, Operator]),
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => ({
//         global: true,
//         secret: configService.get('auth.secret'),
//         signOptions: { expiresIn: configService.get('auth.expires') },
//       }),
//     }),
//     PassportModule,
//     UsersModule,
//   ],
//   exports: [AuthService],
//   providers: [AuthService, LocalAuthStrategy],
//   controllers: [AuthController],
// })
// export class AuthModule {}


// auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Operator } from 'src/operator/entities/operator.entity';
import { Token } from 'src/shared/entities/token.entity';
import { Traveler } from 'src/traveler/entities/traveler.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalAuthStrategy } from './utils/local-auth.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Token, Traveler, Operator]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get('JWT_SECRET'),  // Changed from auth.secret
        signOptions: { 
          expiresIn: configService.get('JWT_EXPIRATION', '24h')  // Changed from auth.expires
        },
      }),
    }),
    PassportModule,
    UsersModule,
  ],
  exports: [AuthService],
  providers: [AuthService, LocalAuthStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
