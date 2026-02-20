import { IsString, IsOptional, IsEnum, IsArray, IsBoolean, IsNumber, IsObject } from 'class-validator';
import { PaymentProvider } from '../entities/payment-gateway.entity';

export class CreateGatewayDto {
  @IsString()
  name: string;

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsOptional()
  @IsObject()
  credentials?: object;

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
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsNumber()
  priority?: number;
}
