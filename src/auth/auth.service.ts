import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Token } from 'src/shared/entities/token.entity';
import { generateRandomToken } from 'src/shared/utils/functions.utils';
import { Traveler } from 'src/traveler/entities/traveler.entity';
import { User } from 'src/users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';
import {
  ForgetPasswordRequestDto,
  LoginRequestDto,
  RegisterRequestDto,
  ResetPasswordRequestDto,
} from './dto/auth-request.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private dataSource: DataSource,
    private jwtService: JwtService,
  ) {}

  async findTokenByIdentifier(identifier: string): Promise<any> {
    try {
      return await this.tokenRepository.findOne({
        where: { identifier },
        relations: ['user'],
      });
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkTokenValidity(
    identifier: string,
    token: string,
  ): Promise<boolean> {
    try {
      const checkValidity = await this.findTokenByIdentifier(identifier);

      if (checkValidity === null) {
        throw {
          status: HttpStatus.NOT_FOUND,
          message: 'OTP not found!',
        };
      }

      const isTokenMatching = await bcrypt.compare(token, checkValidity.token);

      if (!isTokenMatching) {
        throw {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid OTP!',
        };
      }

      return true;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateJwt(payload: User): Promise<AuthResponseDto> {
    try {
      return {
        token: this.jwtService.sign({
          id: payload.id,
          fullname: payload.fullname,
          identifier: payload.identifier,
        }),
        user: payload,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async register(
    payload: RegisterRequestDto,
    type: string,
  ): Promise<AuthResponseDto> {

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let newUserInfo = await this.userRepository.findOne({
        where: [{ identifier: payload.identifier }],
      });

      if (newUserInfo !== null) {
        if (newUserInfo.idempotency_key === payload.idempotency_key) {
          return await this.generateJwt(newUserInfo);
        } else {
          throw new ForbiddenException('Email already have an account!');
        }
      }

      let newTraveler: Traveler = null;
      if (type == 'traveler') {
        newTraveler = new Traveler();
        newTraveler.idempotency_key = payload.idempotency_key;
        newTraveler.fullname = payload.fullname;
        newTraveler.email = payload.identifier;
        newTraveler = await queryRunner.manager.save(newTraveler);
      }

      if (newUserInfo === null) newUserInfo = new User();
      newUserInfo.idempotency_key = payload.idempotency_key;
      newUserInfo.identifier = payload.identifier;
      newUserInfo.fullname = payload.fullname;
      newUserInfo.password = await bcrypt.hash(payload.password, 10);
      type == 'traveler' ? (newUserInfo.traveler = newTraveler) : null;
      newUserInfo = await queryRunner.manager.save(newUserInfo);
      if(payload.role) newUserInfo.role= payload.role;

      await queryRunner.commitTransaction();

      let userInfo = await this.userRepository.findOne({
        where: { identifier: payload.identifier },
        relations: { operator: true, traveler: true },
      });

      return await this.generateJwt(userInfo);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async login(payload: LoginRequestDto): Promise<AuthResponseDto | string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let userInfo = await this.userRepository.findOne({
        where: { identifier: payload.identifier },
        relations: { operator: true, traveler: true },
      });

      if (userInfo === null) {
        throw new UnauthorizedException('Account is invalid!');
      }

      const isPasswordMatching = await bcrypt.compare(
        payload.password,
        userInfo.password,
      );

      if (!isPasswordMatching) {
        throw new UnauthorizedException('Your credentials are incorrect!');
      }

      return await this.generateJwt(userInfo);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async forgetPassword(payload: ForgetPasswordRequestDto): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepository
        .createQueryBuilder('users')
        .where('users.identifier = :identifier', {
          identifier: payload.identifier,
        })
        .getOne();
      if (!user) throw new UnauthorizedException('Unknown identifier!');

      const token = generateRandomToken();
      const hashedToken = await bcrypt.hash(token.toString(), 10);

      let confirmationToken = await this.findTokenByIdentifier(
        payload.identifier,
      );
      if (confirmationToken === null) confirmationToken = new Token();
      confirmationToken.idempotency_key = uuidV4();
      confirmationToken.identifier = payload.identifier;
      confirmationToken.token = hashedToken;
      confirmationToken.validity_period = new Date().setHours(
        new Date().getHours() + 2,
      );
      confirmationToken.user = user;
      await queryRunner.manager.save(confirmationToken);
      await queryRunner.commitTransaction();

      // this.mailService.sendForgotPasswordMail(user, token);
      console.log(token);

      return 'Reset password email sent successfully!';
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async resetPassword(
    payload: ResetPasswordRequestDto,
  ): Promise<AuthResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.checkTokenValidity(payload.identifier, payload.token);

      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(Token)
        .where('identifier = :identifier', { identifier: payload.identifier })
        .execute();

      let userInfo = await this.userRepository.findOne({
        where: { identifier: payload.identifier },
        relations: { operator: true, traveler: true },
      });

      const password = await bcrypt.hash(payload.password, 10);
      userInfo.password = password;
      await queryRunner.manager.save(userInfo);
      await queryRunner.commitTransaction();

      return await this.generateJwt(userInfo);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
