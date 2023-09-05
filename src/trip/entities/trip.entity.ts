import { ApiProperty } from '@nestjs/swagger';
import { Booking } from 'src/booking/entities/booking.entity';
import { Car } from 'src/car/entities/car.entity';
import { Driver } from 'src/driver/entities/driver.entity';
import { Location } from 'src/location/entities/location.entity';
import { Operator } from 'src/operator/entities/operator.entity';
import Audit from 'src/shared/entities/audit.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('locations')
export class Trip extends Audit {
  @ApiProperty({ type: () => Location })
  @ManyToOne(() => Location, (location) => location.departure_trips, {
    onDelete: 'SET NULL',
  })
  departure_location: Location;

  @ApiProperty()
  @Column()
  departure_time: Date;

  @ApiProperty({ type: () => Location })
  @ManyToOne(() => Location, (location) => location.arrival_trips, {
    onDelete: 'SET NULL',
  })
  arrival_location: Location;

  @ApiProperty()
  @Column()
  arrival_time: Date;

  @ApiProperty()
  @Column()
  price: number;

  @ApiProperty({ type: () => Operator })
  @ManyToOne(() => Operator, (operator) => operator.trips, {
    onDelete: 'SET NULL',
  })
  operator: Operator;

  @ApiProperty({ type: () => Car })
  @ManyToOne(() => Car, (car) => car.trips, {
    onDelete: 'SET NULL',
  })
  car: Car;

  @ApiProperty({ type: () => Driver })
  @ManyToOne(() => Driver, (driver) => driver.trips, {
    onDelete: 'SET NULL',
  })
  driver: Driver;

  @ApiProperty({ type: () => Booking, isArray: true })
  @OneToMany(() => Booking, (booking) => booking.trip)
  bookings: Booking[];
}
