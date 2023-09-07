import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InterceptDto } from 'src/shared/dto/intercept.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car } from './entities/car.entity';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    private dataSource: DataSource,
  ) {}

  async create(payload: CreateCarDto): Promise<Car> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let newCar = new Car();
      newCar.idempotency_key = payload.idempotency_key;
      newCar.car_no = payload.car_no;
      newCar.immatriculation_no = payload.immatriculation_no;
      newCar.brand = payload.brand;
      newCar.model = payload.model;
      newCar.type = payload.type;
      newCar = await queryRunner.manager.save(newCar);

      await queryRunner.commitTransaction();
      return newCar;
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

  async findAll(intercept: InterceptDto): Promise<Car[]> {
    try {
      return await this.carRepository.createQueryBuilder('cars').getMany();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string, intercept: InterceptDto): Promise<Car> {
    try {
      return await this.carRepository
        .createQueryBuilder('cars')
        .where('cars.id = :id', {
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

  async update(id: string, payload: UpdateCarDto): Promise<string> {
    const { car_no, immatriculation_no, brand, model, type } = payload;

    try {
      await this.carRepository
        .createQueryBuilder()
        .update(Car)
        .set({ car_no, immatriculation_no, brand, model, type })
        .where('id = :id', { id })
        .execute();

      return 'Updated Car successfully!';
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string, intercept: InterceptDto): Promise<string> {
    try {
      await this.carRepository
        .createQueryBuilder('cars')
        .softDelete()
        .where('id = :id', { id })
        .execute();

      return 'Car deleted successfully!';
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
