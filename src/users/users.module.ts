import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Operator } from 'src/operator/entities/operator.entity';
import { Traveler } from 'src/traveler/entities/traveler.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Traveler, Operator])],
  exports: [UsersModule, UsersService],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
