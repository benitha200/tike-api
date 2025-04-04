import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RouteStop } from 'src/route-stop/entities/route-stop.entity';
import { Route } from 'src/route/entities/routes.entity';
import { Location as Stop } from 'src/Location/entities/location.entity';

@Injectable()
export class RouteStopsService {
    constructor(
        @InjectRepository(RouteStop)
        private readonly routeStopsRepository: Repository<RouteStop>,
        @InjectRepository(Route)
        private readonly routesRepository: Repository<Route>,
        @InjectRepository(Stop)
        private readonly stopsRepository: Repository<Stop>,
        private readonly dataSource: DataSource,
    ) {}

    async create(payload: { routeId: number; stopId: number; stopOrder: number; duration: number }): Promise<RouteStop> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { routeId, stopId, stopOrder, duration } = payload;

            const route = await this.routesRepository.findOne({ where: { id: String(routeId) } });
            if (!route) {
                throw new HttpException('Route not found', HttpStatus.NOT_FOUND);
            }

            const stop = await this.stopsRepository.findOne({ where: { id: String(stopId) } });
            if (!stop) {
                throw new HttpException('Stop not found', HttpStatus.NOT_FOUND);
            }

            let routeStop = new RouteStop();
            routeStop.route = route;
            routeStop.stop = stop;
            routeStop.stopOrder = stopOrder;
            routeStop.duration = duration;

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

    async findByRoute(routeId: number): Promise<RouteStop[]> {
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

    async findOne(id: number): Promise<RouteStop> {
        try {
            return await this.routeStopsRepository
                .createQueryBuilder('routeStops')
                .leftJoinAndSelect('routeStops.route', 'route')
                .leftJoinAndSelect('routeStops.stop', 'stop')
                .where('routeStops.id = :id', { id })
                .getOne();
        } catch (error) {
            throw new HttpException(
                error.message,
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async update(id: number, payload: { stopId?: number; stopOrder?: number; duration?: number }): Promise<string> {
        const { stopId, stopOrder, duration } = payload;

        try {
            const stop = stopId ? await this.stopsRepository.findOne({ where: { id: String(stopId) } }) : undefined;

            await this.routeStopsRepository
                .createQueryBuilder()
                .update(RouteStop)
                .set({
                    stop: stop ?? undefined,
                    stopOrder: stopOrder ?? undefined,
                    duration: duration ?? undefined,
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

    async remove(id: number): Promise<string> {
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
