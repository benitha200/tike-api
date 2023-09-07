import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Traveler } from './entities/traveler.entity';
import { TravelerController } from './traveler.controller';
import { TravelerService } from './traveler.service';

@Module({
  imports: [TypeOrmModule.forFeature([Traveler])],
  exports: [TravelerModule, TravelerService],
  controllers: [TravelerController],
  providers: [TravelerService],
})
export class TravelerModule {}
