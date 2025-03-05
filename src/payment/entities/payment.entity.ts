// payment.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from 'src/booking/entities/booking.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  requestTransactionId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'varchar', length: 10, nullable: true })
  responseCode: string;

  @Column({ type: 'json', nullable: true })
  callbackPayload: Record<string, any>;

  @ManyToOne(() => Booking, (booking) => booking.payments)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column({ type: 'uuid' })
  bookingId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}