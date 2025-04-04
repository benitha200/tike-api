import { ApiProperty } from '@nestjs/swagger';
import Audit from 'src/shared/entities/audit.entity';
import { RouteStop } from 'src/route-stop/entities/route-stop.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('routes')
export class Route extends Audit {
    @ApiProperty()
    @Column()
    name: string;

    @ApiProperty()
    @Column()
    originStopId: string;

    @ApiProperty()
    @Column()
    terminalStopId: string;

    @ApiProperty({ type: () => RouteStop, isArray: true })
    @OneToMany(() => RouteStop, (routeStop) => routeStop.route)
    routeStops: RouteStop[];
}
