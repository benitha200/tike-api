import { ApiProperty } from '@nestjs/swagger';
import Audit from 'src/shared/entities/audit.entity';
import { Trip } from 'src/trip/entities/trip.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('drivers')
export class Driver extends Audit {
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
  emergency_contact_name?: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  emergency_contact_email?: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  emergency_contact_phone_number?: string;

  @ApiProperty({ type: () => Trip, isArray: true })
  @OneToMany(() => Trip, (trips) => trips.arrival_location)
  trips: Trip[];
}
