import { ApiProperty } from '@nestjs/swagger';
import { Payment } from 'src/payment/entities/payment.entity';
import Audit from 'src/shared/entities/audit.entity';
import { Traveler } from 'src/traveler/entities/traveler.entity';
import { Trip } from 'src/trip/entities/trip.entity';
import { Column, Entity, ManyToOne, OneToMany,CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @ApiProperty({ type: () => Traveler })
  @ManyToOne(() => Traveler, (traveler) => traveler.bookings, {
    onDelete: 'SET NULL',
  })
  traveler: Traveler;

  @ApiProperty({ default: false })
  @Column({ default: false })
  canceled: boolean;

  @ApiProperty({ default: false })
  @Column({ default: false })
  payment_status: string;


  @Column({ nullable: true })
  payment_reference: string;

  @OneToMany(() => Payment, payment => payment.booking)
  payments: Payment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
