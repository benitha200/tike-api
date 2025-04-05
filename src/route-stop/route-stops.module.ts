import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteStopsService } from './route-stops.service'; // Adjust to your file path
import { RouteStopsController } from './route-stops.controller'; // Adjust to your file path
import { RouteStop } from './entities/route-stop.entity'; // Adjust to your file path
import { Route } from 'src/route/entities/routes.entity'; // Adjust to your file path
import { Location } from 'src/location/entities/location.entity'; // Adjust to your file path

@Module({
  imports: [TypeOrmModule.forFeature([RouteStop, Route, Location])],
  providers: [RouteStopsService],
  controllers: [RouteStopsController],
})
export class RouteStopsModule {}
