import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InterceptDto } from 'src/shared/dto/intercept.dto';
import { generateCode } from 'src/shared/utils/functions.utils';
import { DataSource, Repository } from 'typeorm';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { Operator } from './entities/operator.entity';

@Injectable()
export class OperatorService {
  constructor(
    @InjectRepository(Operator)
    private readonly operatorRepository: Repository<Operator>,
    private dataSource: DataSource,
  ) {}

  async create(payload: CreateOperatorDto): Promise<Operator> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let code = generateCode(payload.name);

      let newOperator = new Operator();
      newOperator.idempotency_key = payload.idempotency_key;
      newOperator.code = code;
      newOperator.name = payload.name;
      newOperator.logo_url = payload.logo_url;
      newOperator.website_url = payload.website_url;
      newOperator.tin = payload.tin;
      newOperator.tax_inclusive = payload.tax_inclusive;
      newOperator.representative_name = payload.representative_name;
      newOperator.representative_phone = payload.representative_phone;
      newOperator.representative_email = payload.representative_email;
      newOperator.support_phone = payload.support_phone;
      newOperator.support_email = payload.support_email;
      newOperator = await queryRunner.manager.save(newOperator);

      await queryRunner.commitTransaction();
      return newOperator;
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

  async findAll(intercept: InterceptDto): Promise<Operator[]> {
    try {
      return await this.operatorRepository
        .createQueryBuilder('operators')
        .getMany();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string, intercept: InterceptDto): Promise<Operator> {
    try {
      return await this.operatorRepository
        .createQueryBuilder('operators')
        .where('operators.id = :id', {
          id,
        })
        .getOne();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, payload: UpdateOperatorDto): Promise<string> {
    if (payload.user.operator) {
      if (id !== payload.user.operator.id) {
        throw new UnauthorizedException(
          'You are not allowed to delete this user!',
        );
      }
    }

    const {
      name,
      logo_url,
      website_url,
      tin,
      tax_inclusive,
      representative_name,
      representative_phone,
      representative_email,
      support_phone,
      support_email,
    } = payload;

    try {
      await this.operatorRepository
        .createQueryBuilder()
        .update(Operator)
        .set({
          name,
          logo_url,
          website_url,
          tin,
          tax_inclusive,
          representative_name,
          representative_phone,
          representative_email,
          support_phone,
          support_email,
        })
        .where('id = :id', { id })
        .execute();

      return 'Updated operator successfully!';
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string, intercept: InterceptDto): Promise<string> {
    try {
      await this.operatorRepository
        .createQueryBuilder('operators')
        .softDelete()
        .where('id = :id', { id })
        .execute();

      return 'Operator deleted successfully!';
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
