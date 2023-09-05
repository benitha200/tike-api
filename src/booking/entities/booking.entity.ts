import { ApiProperty } from '@nestjs/swagger';
import Audit from 'src/shared/entities/audit.entity';
import { Traveler } from 'src/traveler/entities/traveler.entity';
import { Trip } from 'src/trip/entities/trip.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('bookings')
export class Booking extends Audit {
  @ApiProperty()
  @Column()
  price: string;

  @ApiProperty({ default: true })
  @Column({ default: true })
  is_one_way: boolean;

  @ApiProperty({ type: 'longtext' })
  @Column({ type: 'longtext' })
  notes: string;

  @ApiProperty({ type: () => Trip })
  @ManyToOne(() => Trip, (trip) => trip.bookings, {
    onDelete: 'SET NULL',
  })
  trip: Trip;

  @ApiProperty({ type: () => Traveler })
  @ManyToOne(() => Traveler, (traveler) => traveler.bookings, {
    onDelete: 'SET NULL',
  })
  traveler: Traveler;
}
