import { Appointment, Client, Pet } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Pet, Appointment])],
  controllers: [StatsController],
})
export class StatsModule {}
