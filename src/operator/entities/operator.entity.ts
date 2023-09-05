import { ApiProperty } from '@nestjs/swagger';
import Audit from 'src/shared/entities/audit.entity';
import { Trip } from 'src/trip/entities/trip.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('operators')
export class Operator extends Audit {
  @ApiProperty()
  @Column({ unique: true })
  code: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  logo_url?: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  website_url?: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  tin: string;

  @ApiProperty({ default: false })
  @Column({ default: false })
  tax_inclusive: boolean;

  @ApiProperty()
  @Column()
  representative_name: string;

  @ApiProperty()
  @Column()
  representative_phone: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  representative_email?: string;

  @ApiProperty()
  @Column()
  support_phone: string;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  support_email?: string;

  @ApiProperty({ type: () => OperatorMetadata, isArray: true })
  @OneToMany(() => OperatorMetadata, (metadata) => metadata.operator)
  metadata: OperatorMetadata[];

  @ApiProperty({ type: () => Trip, isArray: true })
  @OneToMany(() => Trip, (trip) => trip.operator)
  trips: Trip[];

  @ApiProperty({ type: () => User, isArray: true })
  @OneToMany(() => User, (user) => user.operator)
  users: User[];
}

@Entity('operators_metadata')
export class OperatorMetadata extends Audit {
  @ApiProperty()
  @Column()
  key: string;

  @ApiProperty()
  @Column({ type: 'longtext' })
  value: string;

  @ApiProperty({ type: () => Operator })
  @ManyToOne(() => Operator, (operator) => operator.metadata, {
    onDelete: 'SET NULL',
  })
  operator: Operator;
}
