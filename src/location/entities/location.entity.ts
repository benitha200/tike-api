import { ApiProperty } from '@nestjs/swagger';
import Audit from 'src/shared/entities/audit.entity';
import { Trip } from 'src/trip/entities/trip.entity';
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

  @ApiProperty({ type: () => Trip, isArray: true })
  @OneToMany(() => Trip, (trips) => trips.departure_location)
  departure_trips: Trip[];

  @ApiProperty({ type: () => Trip, isArray: true })
  @OneToMany(() => Trip, (trips) => trips.arrival_location)
  arrival_trips: Trip[];
}
