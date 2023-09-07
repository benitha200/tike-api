import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InterceptDto } from 'src/shared/dto/intercept.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private dataSource: DataSource,
  ) {}

  async create(payload: CreateLocationDto): Promise<Location> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let newLocation = new Location();
      newLocation.idempotency_key = payload.idempotency_key;
      newLocation.name = payload.name;
      newLocation.city = payload.city;
      newLocation.country = payload.country;
      newLocation = await queryRunner.manager.save(newLocation);
      await queryRunner.commitTransaction();
      return newLocation;
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

  async findAll(intercept: InterceptDto): Promise<Location[]> {
    try {
      return await this.locationRepository
        .createQueryBuilder('locations')
        .getMany();
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string, intercept: InterceptDto): Promise<Location> {
    try {
      return await this.locationRepository
        .createQueryBuilder('locations')
        .where('locations.id = :id', {
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

  async update(id: string, payload: UpdateLocationDto): Promise<string> {
    const { name, city, country } = payload;

    try {
      await this.locationRepository
        .createQueryBuilder()
        .update(Location)
        .set({ name, city, country })
        .where('id = :id', { id })
        .execute();

      return 'Updated Location successfully!';
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string, intercept: InterceptDto): Promise<string> {
    try {
      await this.locationRepository
        .createQueryBuilder('locations')
        .softDelete()
        .where('id = :id', { id })
        .execute();

      return 'Location deleted successfully!';
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
