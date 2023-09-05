import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import Audit from 'src/shared/entities/audit.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity('tokens')
export class Token extends Audit {
  @ApiProperty()
  @IsNotEmpty()
  @Column({ unique: true })
  identifier: string;

  @ApiProperty()
  @IsNotEmpty()
  @Column()
  token: string;

  @ApiProperty()
  @Column('bigint')
  validity_period: number;

  @ApiProperty()
  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
