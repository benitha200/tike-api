import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { Route } from './entities/routes.entity';  // Adjust path
import { Location as Stop} from  'src/location/entities/location.entity'; // Adjust path

@Module({
  imports: [TypeOrmModule.forFeature([Route, Stop])],
  providers: [RoutesService],
  controllers: [RoutesController],
})
export class RoutesModule {}
