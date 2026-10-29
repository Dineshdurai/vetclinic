import { PetGender } from '@app/database';
import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreatePetDto {
  @IsString() @IsNotEmpty() @MaxLength(100) name: string;
  @IsString() @IsOptional() @MaxLength(100) race?: string;
  @IsEnum(PetGender) gender: PetGender;
  @IsDateString() @IsOptional() birht?: string;
  @IsUUID() clientUuid: string;
}

export class UpdatePetDto extends PartialType(CreatePetDto) {}
