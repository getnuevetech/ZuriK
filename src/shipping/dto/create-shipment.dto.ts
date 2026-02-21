import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateShipmentDto {
  @IsString()
  orderId: string;

  @IsString()
  shippingMethodId: string;

  @IsNumber()
  shippingCost: number;

  @IsOptional()
  @IsString()
  shippingAddress?: string;
}
