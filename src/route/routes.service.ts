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

    async create(payload: { name: string; originStop: Location; terminalStop: Location; idempotency_key: string }): Promise<Route> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const originStop = payload.originStop; // Use Stop object directly
            const terminalStop = payload.terminalStop; // Use Stop object directly

            let newRoute = new Route();
            newRoute.idempotency_key = payload.idempotency_key;
            newRoute.name = payload.name;
            newRoute.originStop = originStop;
            newRoute.terminalStop = terminalStop;

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
                relations: ['originStop', 'terminalStop', 'routeStops'],
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
                relations: ['originStop', 'terminalStop', 'routeStops'],
            });
        } catch (error) {
            throw new HttpException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async update(id: string, payload: { name?: string; originStop?: Location; terminalStop?: Location }): Promise<string> {
        try {
            const updateData: Partial<Route> = {};

            if (payload.name) {
                updateData.name = payload.name;
            }

            if (payload.originStop) {
                updateData.originStop = payload.originStop;
            }

            if (payload.terminalStop) {
                updateData.terminalStop = payload.terminalStop;
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
