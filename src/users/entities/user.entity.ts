import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Operator } from 'src/operator/entities/operator.entity';
import Audit from 'src/shared/entities/audit.entity';
import { Traveler } from 'src/traveler/entities/traveler.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity('users')
export class User extends Audit {
  @ApiProperty()
  @Column()
  fullname: string;

  @ApiProperty()
  @Column({ unique: true })
  identifier: string;

  @ApiProperty()
  @Exclude()
  @Column()
  password: string;

  @ApiProperty({ type: () => Operator, nullable: true })
  @ManyToOne(() => Operator, (operator) => operator.users, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  operator?: Operator;

  @ApiProperty({ type: () => Traveler, nullable: true })
  @OneToOne(() => Traveler, { nullable: true })
  @JoinColumn()
  traveler?: Traveler;
}
