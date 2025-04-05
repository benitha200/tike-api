import { ApiProperty } from '@nestjs/swagger';
import { Booking } from 'src/booking/entities/booking.entity';
import { Car } from 'src/car/entities/car.entity';
import { Driver } from 'src/driver/entities/driver.entity';
import { Operator } from 'src/operator/entities/operator.entity';
import { Route } from 'src/route/entities/routes.entity';
import Audit from 'src/shared/entities/audit.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('trips')
export class Trip extends Audit {
  // Removed individual departure_location and arrival_location and price fields
  // Add a relationship to the Route entity instead
  @ApiProperty({ type: () => Route })
  @ManyToOne(() => Route, (route) => route.trips, { onDelete: 'SET NULL' })
  route: Route;  // Reference to the Route entity

  @ApiProperty()
  @Column({ type: 'time' })
  departure_time: String; // Store only time

  // @ApiProperty()
  // @Column({ type: 'time' })
  // arrival_time: String; // Store only time

  @ApiProperty()
  @Column()
  total_seats: number;

  // Removed price field from Trip entity
  // The price will now be fetched from the Route entity

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

  @ApiProperty()
  @Column({ default: true })
  is_daily: boolean;
}
