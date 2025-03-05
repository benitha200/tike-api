import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InterceptDto } from 'src/shared/dto/intercept.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver } from './entities/driver.entity';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    private dataSource: DataSource,
  ) {}

  async create(payload: CreateDriverDto): Promise<Driver> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let newDriver = new Driver();
      newDriver.idempotency_key = payload.idempotency_key;
      newDriver.fullname = payload.fullname;
      newDriver.nationality = payload.nationality;
      newDriver.dob = payload.dob;
      newDriver.gender = payload.gender;
      newDriver.phone_number = payload.phone_number;
      newDriver.emergency_contact_name = payload.emergency_contact_name;
      newDriver.emergency_contact_email = payload.emergency_contact_email;
      newDriver.emergency_contact_phone_number =
        payload.emergency_contact_phone_number;
      newDriver = await queryRunner.manager.save(newDriver);

      await queryRunner.commitTransaction();
      return newDriver;
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

  async findAll(intercept: InterceptDto): Promise<Driver[]> {
    try {
      return await this.driverRepository
        .createQueryBuilder('drivers')
        .getMany();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string, intercept: InterceptDto): Promise<Driver> {
    try {
      return await this.driverRepository
        .createQueryBuilder('drivers')
        .where('drivers.id = :id', {
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

  async update(id: string, payload: UpdateDriverDto): Promise<string> {
    const {
      fullname,
      nationality,
      dob,
      gender,
      phone_number,
      emergency_contact_name,
      emergency_contact_email,
      emergency_contact_phone_number,
    } = payload;

    try {
      await this.driverRepository
        .createQueryBuilder()
        .update(Driver)
        .set({
          fullname,
          nationality,
          dob,
          gender,
          phone_number,
          emergency_contact_name,
          emergency_contact_email,
          emergency_contact_phone_number,
        })
        .where('id = :id', { id })
        .execute();

      return 'Updated driver successfully!';
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string, intercept: InterceptDto): Promise<string> {
    try {
      await this.driverRepository
        .createQueryBuilder('drivers')
        .softDelete()
        .where('id = :id', { id })
        .execute();

      return 'Driver deleted successfully!';
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
