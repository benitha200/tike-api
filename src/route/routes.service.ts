import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Route } from 'src/route/entities/routes.entity';
import { Location } from 'src/location/entities/location.entity';
import { RouteStop }  from 'src/route-stop/entities/route-stop.entity';
import { UpdateRouteDto } from './dto/update-route.dto';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private readonly routesRepository: Repository<Route>,

    @InjectRepository(Location)
    private readonly stopsRepository: Repository<Location>,

    @InjectRepository(RouteStop)
    private readonly routeStopsRepository: Repository<RouteStop>,

    private readonly dataSource: DataSource,
  ) {}

  async create(payload: {
    name: string;
    departure_location: string;  // UUID
    arrival_location: string;    // UUID
    idempotency_key: string;
    total_duration: number;
    total_price: number;
    routeStops: {
      stopName: string;
      stopOrder: number;
      duration: number;
      price: number;
    }[];
  }): Promise<Route> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const departure_location = await this.stopsRepository.findOneByOrFail({ id: payload.departure_location });
      const arrival_location = await this.stopsRepository.findOneByOrFail({ id: payload.arrival_location });
  
      let newRoute = new Route();
      newRoute.idempotency_key = payload.idempotency_key;
      newRoute.name = payload.name;
      newRoute.departure_location = departure_location;
      newRoute.arrival_location = arrival_location;
      newRoute.total_duration = payload.total_duration;
      newRoute.total_price = payload.total_price;
      newRoute.arrival_location = arrival_location;
  
      newRoute = await queryRunner.manager.save(newRoute);
  
      // Save route stops
      for (const stop of payload.routeStops) {
        await queryRunner.manager.insert('route_stops', {
          ...stop,
          routeId: newRoute.id,
        });
      }
  
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
        const route = await this.routesRepository.findOne({
          where: { id },
          relations: ['departure_location', 'arrival_location', 'routeStops'],
        });

        if (!route) {
          throw new HttpException('Route not found', HttpStatus.NOT_FOUND);
        }

        // Sort routeStops by stopOrder
        route.routeStops = route.routeStops.sort((a, b) => a.stopOrder - b.stopOrder);

        return route;
      } catch (error) {
        throw new HttpException(
          error.message,
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
  }

  async update(id: string, payload: UpdateRouteDto): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const updateData: Partial<Route> = {};
  
      if (payload.name) {
        updateData.name = payload.name;
        //updateData.idempotency_key = payload.idempotency_key;
      }
  
      if (payload.departure_location) {
        const departureLocation = await this.stopsRepository.findOneByOrFail({ id: payload.departure_location });
        updateData.departure_location = departureLocation;
      }
  
      if (payload.arrival_location) {
        const arrivalLocation = await this.stopsRepository.findOneByOrFail({ id: payload.arrival_location });
        updateData.arrival_location = arrivalLocation;
      }
        // Update total_duration and total_price if provided
        if (payload.total_duration) {
            updateData.total_duration = payload.total_duration;
        }
        // Update total_price if provided
        if (payload.total_price) {
            updateData.total_price = payload.total_price;
        }
      await queryRunner.manager.update(Route, id, updateData);
  
      if (payload.routeStops) {
        // First delete existing route stops
        await queryRunner.manager.delete(RouteStop, { routeId: id });
  
        // Save route stops
        for (const stop of payload.routeStops) {
            await queryRunner.manager.insert('route_stops', {
            ...stop,
            routeId: id,
            });
        }
        }
  
      await queryRunner.commitTransaction();
      return 'Updated Route successfully!';
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
  

  async remove(id: string): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete stops first
      await queryRunner.manager.delete(RouteStop, { routeId: id });

      // Soft-delete the route
      await queryRunner.manager.softDelete(Route, { id });

      await queryRunner.commitTransaction();
      return 'Route and associated stops deleted successfully!';
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
}
