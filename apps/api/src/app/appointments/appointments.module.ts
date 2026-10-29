import { Appointment, Pet, User } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Pet, User])],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {}
