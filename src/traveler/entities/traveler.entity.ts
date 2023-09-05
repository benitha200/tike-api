import { ApiProperty } from '@nestjs/swagger';
import { Booking } from 'src/booking/entities/booking.entity';
import Audit from 'src/shared/entities/audit.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('travelers')
export class Traveler extends Audit {
  @ApiProperty()
  @Column()
  fullname: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  nationality?: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  dob?: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  gender?: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  phone_number?: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  tax_id?: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  emergency_contact_name?: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  emergency_contact_email?: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  emergency_contact_phone_number?: string;

  @ApiProperty({ type: () => Booking, isArray: true })
  @OneToMany(() => Booking, (booking) => booking.traveler)
  bookings: Booking[];
}
