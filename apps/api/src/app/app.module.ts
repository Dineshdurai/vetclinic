import {
  Appointment,
  Client,
  DatabaseModule,
  Pet,
  Procedure,
  ProcedureCategory,
  User,
} from '@app/database';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import * as Joi from 'joi';
import { configs } from '../../../../config/apps.config';
import { AppointmentsModule } from './appointments/appointments.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { PetsModule } from './pets/pets.module';
import { StatsModule } from './stats/stats.module';
import { UsersModule } from './users/users.module';

/**
 * AppModule class.
 *
 * @module
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [configs],
      validationSchema: Joi.object({
        API_PORT: Joi.number().optional(),
        PORT: Joi.number().optional(),
        DATABASE_URL: Joi.string().optional(),
        DATABASE_SSL: Joi.boolean().optional(),
        DATABASE_TYPE: Joi.string().default('postgres'),
        DATABASE_HOST: Joi.string().default('localhost'),
        DATABASE_PORT: Joi.number().default(5432),
        // The individual settings are only required when DATABASE_URL is not used.
        DATABASE_USERNAME: Joi.string().when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        }),
        DATABASE_PASSWORD: Joi.string().when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        }),
        DATABASE_DATABASE: Joi.string().when('DATABASE_URL', {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        }),
        JWT_SECRET: Joi.string().min(16).required(),
        ADMIN_USERNAME: Joi.string().optional(),
        ADMIN_PASSWORD: Joi.string().optional(),
        ADMIN_EMAIL: Joi.string().optional(),
        DATABASE_LOGGING: Joi.any().default(false).optional(),
        DATABASE_RETRY_ATTEMPTS: Joi.number().default(10).optional(),
        DATABASE_RETRY_DELAY: Joi.number().default(3000).optional(),
      }),
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([
      Appointment,
      Client,
      Pet,
      Procedure,
      ProcedureCategory,
      User,
    ]),
    AuthModule,
    UsersModule,
    ClientsModule,
    PetsModule,
    AppointmentsModule,
    StatsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
