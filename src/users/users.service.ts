import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Operator } from 'src/operator/entities/operator.entity';
import { InterceptDto } from 'src/shared/dto/intercept.dto';
import { Traveler } from 'src/traveler/entities/traveler.entity';
import { DataSource, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Traveler)
    private readonly travelerRepository: Repository<Traveler>,
    @InjectRepository(Operator)
    private readonly operatorRepository: Repository<Operator>,
    private dataSource: DataSource,
  ) {}

  async myProfile(
    id: string,
    intercept: InterceptDto,
    shelf?: string,
  ): Promise<User> {
    try {
      let user = await this.userRepository
        .createQueryBuilder('users')
        .leftJoinAndSelect('users.traveler', 'travelers')
        .leftJoinAndSelect('users.operator', 'operators')
        .where('users.id = :id', {
          id,
        })
        .andWhere('users.identifier = :identifier', {
          identifier: intercept.user.identifier,
        })
        .getOne();

      return user;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, payload: UpdateUserDto): Promise<string> {
    const {
      fullname,
      identifier,
      password,
      nationality,
      dob,
      gender,
      phone_number,
      email,
      tax_id,
      emergency_contact_name,
      emergency_contact_email,
      emergency_contact_phone_number,
      operator_code,
    } = payload;
    if (id !== payload.user.id) {
      throw new UnauthorizedException('You are not allowed to edit this user!');
    }

    let operator = null;
    if (operator_code) {
      operator = await this.operatorRepository
        .createQueryBuilder('operators')
        .where('code = :operator_code', { operator_code })
        .getOne();
    }

    try {
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          identifier,
          fullname,
          password,
          operator,
        })
        .where('id = :id', { id })
        .execute();

      if (payload.user.traveler) {
        await this.travelerRepository
          .createQueryBuilder()
          .update(Traveler)
          .set({
            fullname,
            nationality,
            dob,
            gender,
            phone_number,
            email,
            tax_id,
            emergency_contact_name,
            emergency_contact_email,
            emergency_contact_phone_number,
          })
          .where('id = :id', { id })
          .execute();
      }

      return 'Profile updated successfully!';
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string, intercept: InterceptDto): Promise<string> {
    if (id !== intercept.user.id) {
      throw new UnauthorizedException(
        'You are not allowed to delete this user!',
      );
    }

    try {
      await this.userRepository
        .createQueryBuilder('users')
        .softDelete()
        .where('id = :id', { id })
        .execute();

      return 'User deleted successfully!';
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
