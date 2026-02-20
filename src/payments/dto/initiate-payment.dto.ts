import { IsEnum, IsString, IsOptional, IsUUID } from 'class-validator';
import { PaymentProvider } from '../entities/payment.entity';

export class InitiatePaymentDto {
  @IsUUID()
  orderId: string;

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsString()
  @IsOptional()
  callbackUrl?: string;
}
