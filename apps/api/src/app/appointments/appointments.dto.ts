import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

export class CreateAppointmentDto {
  @IsString() @IsNotEmpty() @MaxLength(100) proposite: string;
  @IsString() @IsOptional() description?: string;
  @IsDateString() scheduleAt: string;
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'scheduleTime must be HH:mm' })
  @IsOptional() scheduleTime?: string;
  @IsUUID() petUuid: string;
  @IsUUID() @IsOptional() userUuid?: string;
}

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {}
