import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Operator } from './entities/operator.entity';
import { OperatorController } from './operator.controller';
import { OperatorService } from './operator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Operator])],
  exports: [OperatorModule, OperatorService],
  controllers: [OperatorController],
  providers: [OperatorService],
})
export class OperatorModule {}
