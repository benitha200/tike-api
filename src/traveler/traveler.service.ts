import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InterceptDto } from 'src/shared/dto/intercept.dto';
import { DataSource, Repository } from 'typeorm';
import { Traveler } from './entities/traveler.entity';
import { CreateTravelerDTO } from './dto/create-traveler.dto';

@Injectable()
export class TravelerService {
  constructor(
    @InjectRepository(Traveler)
    private readonly travelerRepository: Repository<Traveler>,
    private dataSource: DataSource,
  ) {}

  async create(payload: CreateTravelerDTO): Promise<Traveler> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let newTraveler = new Traveler();
      newTraveler.idempotency_key = payload.idempotency_key;
      newTraveler.fullname = payload.fullname;
      newTraveler.nationality = payload.nationality;
      newTraveler.dob = payload.dob;
      newTraveler.gender = payload.gender;
      newTraveler.phone_number = payload.phone_number;
      newTraveler.email = payload.email;
      newTraveler.tax_id = payload.tax_id;
      newTraveler.emergency_contact_name = payload.emergency_contact_name;
      newTraveler.emergency_contact_email = payload.emergency_contact_email;
      newTraveler.emergency_contact_phone_number = payload.emergency_contact_phone_number;
      newTraveler.bookings = payload.bookings;
      newTraveler = await queryRunner.manager.save(newTraveler);

      await queryRunner.commitTransaction();
      return newTraveler;
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
