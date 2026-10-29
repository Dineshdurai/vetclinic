import { Client, Pet } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetsController } from './pets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pet, Client])],
  controllers: [PetsController],
})
export class PetsModule {}
