import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InterceptDto } from 'src/shared/dto/intercept.dto';
import { DataSource, Repository } from 'typeorm';
import { Traveler } from './entities/traveler.entity';

@Injectable()
export class TravelerService {
  constructor(
    @InjectRepository(Traveler)
    private readonly travelerRepository: Repository<Traveler>,
    private dataSource: DataSource,
  ) {}

  async findAll(intercept: InterceptDto): Promise<Traveler[]> {
    try {
      return await this.travelerRepository
        .createQueryBuilder('travelers')
        .getMany();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string, intercept: InterceptDto): Promise<Traveler> {
    try {
      return await this.travelerRepository
        .createQueryBuilder('travelers')
        .where('travelers.id = :id', {
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

  async remove(id: string, intercept: InterceptDto): Promise<string> {
    try {
      await this.travelerRepository
        .createQueryBuilder('travelers')
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
