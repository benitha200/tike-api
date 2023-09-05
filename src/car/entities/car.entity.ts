import { ApiProperty } from '@nestjs/swagger';
import { Operator } from 'src/operator/entities/operator.entity';
import Audit from 'src/shared/entities/audit.entity';
import { Trip } from 'src/trip/entities/trip.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('cars')
export class Car extends Audit {
  @ApiProperty()
  @Column()
  car_no: string;

  @ApiProperty()
  @Column()
  immatriculation_no: string;

  @ApiProperty()
  @Column()
  brand: string;

  @ApiProperty()
  @Column()
  model: string;

  @ApiProperty()
  @Column()
  type: string;

  @ApiProperty({ type: () => CarMetadata, isArray: true })
  @OneToMany(() => CarMetadata, (metadata) => metadata.car)
  metadata: CarMetadata[];

  @ApiProperty({ type: () => Operator })
  @ManyToOne(() => Car, (car) => car.metadata, {
    onDelete: 'SET NULL',
  })
  operator: Operator;

  @ApiProperty({ type: () => CarMetadata, isArray: true })
  @OneToMany(() => Trip, (trip) => trip.car)
  trips: Trip[];
}

@Entity('cars_metadata')
export class CarMetadata extends Audit {
  @ApiProperty()
  @Column()
  key: string;

  @ApiProperty()
  @Column({ type: 'longtext' })
  value: string;

  @ApiProperty({ type: () => Car })
  @ManyToOne(() => Car, (car) => car.metadata, {
    onDelete: 'SET NULL',
  })
  car: Car;
}
