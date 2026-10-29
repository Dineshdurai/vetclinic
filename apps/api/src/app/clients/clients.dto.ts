import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateClientDto {
  @IsString() @IsNotEmpty() @MaxLength(100) firstName: string;
  @IsString() @IsOptional() @MaxLength(100) lastName?: string;
  @IsEmail() @MaxLength(320) email: string;
  @IsString() @IsOptional() @MaxLength(25) phone?: string;
  @IsString() @IsOptional() @MaxLength(100) address?: string;
  @IsString() @IsOptional() @MaxLength(100) addressDetails?: string;
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}
