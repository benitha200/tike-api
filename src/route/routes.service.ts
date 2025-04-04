import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Route } from 'src/route/entities/routes.entity';

@Injectable()
export class RoutesService {
    constructor(
        @InjectRepository(Route)
        private readonly routesRepository: Repository<Route>,
        private readonly dataSource: DataSource,
    ) {}

    async create(payload: { name: string; originStopId: string; terminalStopId: string; idempotency_key: string }): Promise<Route> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let newRoute = new Route();
            newRoute.idempotency_key = payload.idempotency_key;
            newRoute.name = payload.name;
            newRoute.originStopId = payload.originStopId;
            newRoute.terminalStopId = payload.terminalStopId;
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
            return await this.routesRepository
                .createQueryBuilder('routes')
                .getMany();
        } catch (error) {
            throw new HttpException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOne(id: number): Promise<Route> {
        try {
            return await this.routesRepository
                .createQueryBuilder('routes')
                .where('routes.id = :id', { id })
                .getOne();
        } catch (error) {
            throw new HttpException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async update(id: number, payload: { name?: string; originStopId?: string; terminalStopId?: string }): Promise<string> {
        const { name, originStopId, terminalStopId } = payload;

        try {
            await this.routesRepository
                .createQueryBuilder()
                .update(Route)
                .set({ name, originStopId, terminalStopId })
                .where('id = :id', { id })
                .execute();

            return 'Updated Route successfully!';
        } catch (error) {
            throw new HttpException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async remove(id: number): Promise<string> {
        try {
            await this.routesRepository
                .createQueryBuilder('routes')
                .softDelete()
                .where('id = :id', { id })
                .execute();

            return 'Route deleted successfully!';
        } catch (error) {
            throw new HttpException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
