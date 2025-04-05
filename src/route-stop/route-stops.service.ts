import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RouteStop } from 'src/route-stop/entities/route-stop.entity';
import { Route } from 'src/route/entities/routes.entity';

@Injectable()
export class RouteStopsService {
    constructor(
        @InjectRepository(RouteStop)
        private readonly routeStopsRepository: Repository<RouteStop>,
        @InjectRepository(Route)
        private readonly routesRepository: Repository<Route>,
        private readonly dataSource: DataSource,
    ) {}

    async create(payload: { routeId: string; stopName: string; stopOrder: number; duration: number; price: number }): Promise<RouteStop> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { routeId, stopName, stopOrder, duration, price } = payload;

            // Find the route by its ID
            const route = await this.routesRepository.findOne({ where: { id: routeId } });
            if (!route) {
                throw new HttpException('Route not found', HttpStatus.NOT_FOUND);
            }

            // Create the RouteStop entity
            let routeStop = new RouteStop();
            routeStop.route = route;
            routeStop.stopName = stopName; // Use stopName directly instead of Stop entity
            routeStop.stopOrder = stopOrder;
            routeStop.duration = duration;
            routeStop.price = price;

            // Save the new route stop in the database
            routeStop = await queryRunner.manager.save(routeStop);
            await queryRunner.commitTransaction();
            return routeStop;
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

    async findByRoute(routeId: string): Promise<RouteStop[]> {
        try {
            return await this.routeStopsRepository
                .createQueryBuilder('routeStops')
                .where('routeStops.routeId = :routeId', { routeId })
                .orderBy('routeStops.stopOrder', 'ASC')
                .getMany();
        } catch (error) {
            throw new HttpException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async findOne(id: string): Promise<RouteStop> {
        try {
            return await this.routeStopsRepository
                .createQueryBuilder('routeStops')
                .where('routeStops.id = :id', { id })
                .getOne();
        } catch (error) {
            throw new HttpException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async update(id: string, payload: { stopName?: string; stopOrder?: number; duration?: number; price?: number }): Promise<string> {
        const { stopName, stopOrder, duration, price } = payload;

        try {
            await this.routeStopsRepository
                .createQueryBuilder()
                .update(RouteStop)
                .set({
                    stopName: stopName ?? undefined,
                    stopOrder: stopOrder ?? undefined,
                    duration: duration ?? undefined,
                    price: price ?? undefined,
                })
                .where('id = :id', { id })
                .execute();

            return 'Route Stop updated successfully!';
        } catch (error) {
            throw new HttpException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async remove(id: string): Promise<string> {
        try {
            await this.routeStopsRepository
                .createQueryBuilder('routeStops')
                .softDelete()
                .where('id = :id', { id })
                .execute();

            return 'Route Stop deleted successfully!';
        } catch (error) {
            throw new HttpException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
