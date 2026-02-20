import { IsString, IsOptional } from 'class-validator';

export class UpdateSubOrderTrackingDto {
  @IsString()
  trackingNumber: string;

  @IsOptional()
  @IsString()
  fabricTrackingNumber?: string;
}
