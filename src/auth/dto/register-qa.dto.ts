import { IsEmail, IsString, MinLength, IsOptional, IsArray, IsNumber } from 'class-validator';

export class RegisterQaDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  qaFacilityName: string;

  @IsString()
  qaAddressLine1: string;

  @IsString()
  qaCity: string;

  @IsString()
  qaState: string;

  @IsString()
  qaCountry: string;

  @IsOptional()
  @IsString()
  qaPostalCode?: string;

  @IsOptional()
  @IsString()
  qaContactPhone?: string;

  @IsOptional()
  @IsArray()
  qaServesRegions?: string[];

  @IsOptional()
  @IsNumber()
  qaPriority?: number;

  @IsOptional()
  @IsNumber()
  qaCapacity?: number;
}
