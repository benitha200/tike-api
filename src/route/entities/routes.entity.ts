import { ApiProperty } from '@nestjs/swagger';
import Audit from 'src/shared/entities/audit.entity';
import { RouteStop } from 'src/route-stop/entities/route-stop.entity';
import { Location as Stop } from 'src/location/entities/location.entity'; // Stop entity
import { Column, Entity, OneToMany, ManyToOne } from 'typeorm';

@Entity('routes')
export class Route extends Audit {
    @ApiProperty()
    @Column()
    name: string;

    @ApiProperty({ type: () => Stop })
    @ManyToOne(() => Stop)
    originStop: Stop;

    @ApiProperty({ type: () => Stop })
    @ManyToOne(() => Stop)
    terminalStop: Stop;

    @ApiProperty({ type: () => RouteStop, isArray: true })
    @OneToMany(() => RouteStop, (routeStop) => routeStop.route)
    routeStops: RouteStop[];
}
