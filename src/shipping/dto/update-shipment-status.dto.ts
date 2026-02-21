import { IsString, IsOptional, IsEnum } from 'class-validator';

const SHIPMENT_STATUSES = ['pending', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'] as const;

export class UpdateShipmentStatusDto {
  @IsEnum(SHIPMENT_STATUSES)
  status: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  location?: string;
}
