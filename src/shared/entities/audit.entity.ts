import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

class Audit {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @Column({ unique: true })
  @Exclude()
  idempotency_key: string;

  @Exclude()
  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @Exclude()
  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;

  @Exclude()
  @ApiProperty()
  @DeleteDateColumn()
  deleted_at: Date;
}

export default Audit;
