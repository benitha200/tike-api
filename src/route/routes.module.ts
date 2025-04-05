import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { Route } from './entities/routes.entity';
import { Location } from 'src/location/entities/location.entity';
import { RouteStop } from 'src/route-stop/entities/route-stop.entity'; // Adjust the path if different

@Module({
  imports: [
    TypeOrmModule.forFeature([Route, Location, RouteStop]), // 👈 Include RouteStop here
  ],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
