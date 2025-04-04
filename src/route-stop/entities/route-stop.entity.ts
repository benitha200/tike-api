import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Route } from 'src/route/entities/routes.entity';
import { Location as Stop } from 'src/location/entities/location.entity';
import Audit from 'src/shared/entities/audit.entity';

@Entity('route_stops')
export class RouteStop extends Audit {

  @ApiProperty()
  @Column()
  routeId: number;

  @ApiProperty()
  @Column()
  stopId: number;

  @ApiProperty()
  @Column()
  stopOrder: number;

  @ApiProperty({ default: 0 })
  @Column({ default: 0 })
  duration: number; // Duration from previous stop in minutes

  @ApiProperty({ type: () => Route })
  @ManyToOne(() => Route, (route) => route.routeStops)
  route: Route;

  @ApiProperty({ type: () => Location })
  @ManyToOne(() => Stop, (stop) => stop.routeStops)
  stop: Stop;
}
