import { IsString, IsOptional, IsEnum, IsArray, IsBoolean, IsNumber, IsObject } from 'class-validator';
import { ShippingProvider } from '../entities/shipping-carrier.entity';

export class CreateCarrierDto {
  @IsString()
  name: string;

  @IsEnum(ShippingProvider)
  provider: ShippingProvider;

  @IsOptional()
  @IsObject()
  settings?: object;

  @IsOptional()
  @IsArray()
  supportedCountries?: string[];

  @IsOptional()
  @IsArray()
  supportedCurrencies?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  priority?: number;
}
