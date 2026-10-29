import { Client } from '@app/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsController } from './clients.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  controllers: [ClientsController],
})
export class ClientsModule {}
