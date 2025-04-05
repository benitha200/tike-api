import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Route } from 'src/route/entities/routes.entity';
import { Location } from 'src/location/entities/location.entity'; // Stop entity

@Injectable()
export class RoutesService {
    constructor(
        @InjectRepository(Route)
        private readonly routesRepository: Repository<Route>,

        @InjectRepository(Location)
        private readonly stopsRepository: Repository<Location>,

        private readonly dataSource: DataSource,
    ) {}

    async create(payload: { name: string; departure_location: Location; arrival_location: Location; idempotency_key: string }): Promise<Route> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const departure_location = payload.departure_location; // Use Stop object directly
            const arrival_location = payload.arrival_location; // Use Stop object directly

            let newRoute = new Route();
            newRoute.idempotency_key = payload.idempotency_key;
            newRoute.name = payload.name;
            newRoute.departure_location = departure_location;
            newRoute.arrival_location = arrival_location;

            newRoute = await queryRunner.manager.save(newRoute);
            await queryRunner.commitTransaction();
            return newRoute;
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

    async findAll(): Promise<Route[]> {
        try {
            return await this.routesRepository.find({
                relations: ['departure_location', 'arrival_location', 'routeStops'],
            });
        } catch (error) {
            throw new HttpException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOne(id: string): Promise<Route> {
        try {
            return await this.routesRepository.findOne({
                where: { id },
                relations: ['departure_location', 'arrival_location', 'routeStops'],
            });
        } catch (error) {
            throw new HttpException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async update(id: string, payload: { name?: string; departure_location?: Location; arrival_location?: Location }): Promise<string> {
        try {
            const updateData: Partial<Route> = {};

            if (payload.name) {
                updateData.name = payload.name;
            }

            if (payload.departure_location) {
                updateData.departure_location = payload.departure_location;
            }

            if (payload.arrival_location) {
                updateData.arrival_location = payload.arrival_location;
            }

            await this.routesRepository.update(id, updateData);
            return 'Updated Route successfully!';
        } catch (error) {
            throw new HttpException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async remove(id: string): Promise<string> {
        try {
            await this.routesRepository.softDelete(id);
            return 'Route deleted successfully!';
        } catch (error) {
            throw new HttpException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
