import { ApiProperty } from '@nestjs/swagger';
import Audit from 'src/shared/entities/audit.entity';
import { Route } from 'src/route/entities/routes.entity';
import { Column, Entity, OneToMany } from 'typeorm';
@Entity('locations')
export class Location extends Audit {
  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  city: string;

  @ApiProperty()
  @Column()
  country: string;

  @ApiProperty({ type: () => Route, isArray: true })
  @OneToMany(() => Route, (Routes) => Routes.departure_location)
  departure_Routes: Route[];

  @ApiProperty({ type: () => Route, isArray: true })
  @OneToMany(() => Route, (Routes) => Routes.arrival_location)
  arrival_Routes: Route[];

}
