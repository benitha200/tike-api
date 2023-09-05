import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { InterceptDto } from 'src/shared/dto/intercept.dto';
import { DataSource, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async myProfile(
    id: string,
    intercept: InterceptDto,
    shelf?: string,
  ): Promise<User> {
    try {
      let user = null;

      switch (shelf) {
        case 'favorites':
          user = await this.userRepository
            .createQueryBuilder('users')
            .leftJoinAndSelect('users.favorites', 'favorites')
            .leftJoinAndSelect('favorites.book', 'books')
            .where('users.id = :id', {
              id,
            })
            .andWhere('users.identifier = :identifier', {
              identifier: intercept.user.identifier,
            })
            .getOne();
          break;
        case 'continue-reading':
          console.log('continue-reading');
          break;
        case 'badges':
          user = await this.userRepository
            .createQueryBuilder('users')
            .leftJoinAndSelect('users.activities', 'activities')
            .where('users.id = :id', {
              id,
            })
            .andWhere('users.identifier = :identifier', {
              identifier: intercept.user.identifier,
            })
            .getOne();
          break;

        default:
          user = await this.userRepository
            .createQueryBuilder('users')
            .leftJoinAndSelect('users.favorites', 'favorites')
            .leftJoinAndSelect('users.activities', 'activities')
            .where('users.id = :id', {
              id,
            })
            .andWhere('users.identifier = :identifier', {
              identifier: intercept.user.identifier,
            })
            .getOne();
          break;
      }

      return user;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, payload: UpdateUserDto): Promise<string> {
    const { identifier, fullname, dob, gender, picture_url, level } = payload;
    if (id !== payload.user.id) {
      throw new UnauthorizedException('You are not allowed to edit this user!');
    }

    try {
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          identifier,
          fullname,
        })
        .where('id = :id', { id })
        .execute();

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
        .createQueryBuilder()
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
