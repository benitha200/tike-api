// booking.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { Payment } from 'src/payment/entities/payment.entity';
import Audit from 'src/shared/entities/audit.entity';
import { Traveler } from 'src/traveler/entities/traveler.entity';
import { Trip } from 'src/trip/entities/trip.entity';
import { Column, Entity, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Route } from 'src/route/entities/routes.entity';
import { RouteStop } from 'src/route-stop/entities/route-stop.entity';
import { JoinColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity('bookings')
export class Booking extends Audit {
  @ApiProperty()
  @Column()
  price: number;

  @ApiProperty({ default: true }) 
  @Column({ default: true })
  is_one_way: boolean;

  @ApiProperty({ type: 'longtext', nullable: true })
  @Column({ type: 'longtext', nullable: true })
  notes?: string;

  @ApiProperty({ type: () => Trip })
  @ManyToOne(() => Trip, (trip) => trip.bookings, {
    onDelete: 'SET NULL',
  })
  trip: Trip;

  @ApiProperty()
  @Column()
  trip_date: String;

  @ApiProperty({ type: () => Traveler })
  @ManyToOne(() => Traveler, (traveler) => traveler.bookings, {
    onDelete: 'SET NULL',
  })
  traveler: Traveler;

  @ApiProperty({ default: false })
  @Column({ default: false })
  canceled: boolean;

  @ApiProperty()
  @Column({ default: 'PENDING' })
  payment_status: string;

  @Column({ nullable: true })
  payment_reference: string;

  @OneToMany(() => Payment, payment => payment.booking)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  @ApiProperty()
  seat_number?: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'varchar', length: 36, nullable: true })
  routeId?: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'varchar', length: 36, nullable: true })
  inStopId?: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'varchar', length: 36, nullable: true })
  outStopId?: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  routeName?: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  inStopName?: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  outStopName?: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  departure_time?: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  arrival_time?: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  arrival_date?: string;

  @ManyToOne(() => Route, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'routeId' })
  route?: Route;

  @ManyToOne(() => RouteStop, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'inStopId' })
  inStop?: RouteStop;

  @ManyToOne(() => RouteStop, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'outStopId' })
  outStop?: RouteStop;

}