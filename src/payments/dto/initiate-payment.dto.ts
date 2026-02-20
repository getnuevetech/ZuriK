import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum InitiatePaymentProvider {
  PAYSTACK = 'PAYSTACK',
  STRIPE = 'STRIPE',
}

export class InitiatePaymentDto {
  @IsString()
  orderId: string;

  @IsEnum(InitiatePaymentProvider)
  provider: InitiatePaymentProvider;

  @IsString()
  @IsOptional()
  callbackUrl?: string;
}
