import { IsString, IsOptional } from 'class-validator';

export class AssignTrackingDto {
  @IsString()
  trackingNumber: string;

  @IsString()
  carrier: string;

  @IsOptional()
  @IsString()
  carrierTrackingUrl?: string;
}
