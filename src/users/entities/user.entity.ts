import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import Audit from 'src/shared/entities/audit.entity';
import { Column, Entity } from 'typeorm';

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
}
