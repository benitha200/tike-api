import { ApiProperty } from '@nestjs/swagger';
import Audit from 'src/shared/entities/audit.entity';
import { RouteStop } from 'src/route-stop/entities/route-stop.entity';
import { Location } from 'src/location/entities/location.entity'; // Stop entity
import { Column, Entity, OneToMany, ManyToOne } from 'typeorm';

@Entity('routes')
export class Route extends Audit {
    @ApiProperty()
    @Column()
    name: string;

    @ApiProperty({ type: () => Location })
    @ManyToOne(() => Location)
    departure_location: Location;

    @ApiProperty({ type: () => Location })
    @ManyToOne(() => Location)
    arrival_location: Location;

    @ApiProperty({ type: () => RouteStop, isArray: true })
    @OneToMany(() => RouteStop, (routeStop) => routeStop.route)
    routeStops: RouteStop[];
}
