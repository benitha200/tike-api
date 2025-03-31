import { ApiProperty } from '@nestjs/swagger';
import { Trip } from 'src/trip/entities/trip.entity';
import { Location } from 'src/location/entities/location.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('trip_segments')
export class TripSegment {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')  // Add this line to make this entity have a primary key
  id: string;

  @ApiProperty()
  @ManyToOne(() => Trip, (trip) => trip.id, { onDelete: 'CASCADE' })
  trip: Trip;

  @ApiProperty({ type: () => Location })
  @ManyToOne(() => Location, (location) => location.id, { onDelete: 'SET NULL' })
  fromStop: Location;

  @ApiProperty({ type: () => Location })
  @ManyToOne(() => Location, (location) => location.id, { onDelete: 'SET NULL' })
  toStop: Location;

  @ApiProperty()
  @Column('int')
  price: number;
}
