import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  designId: string;

  @IsString()
  fabricId: string;

  @IsOptional()
  @IsString()
  measurementId?: string;

  @IsOptional()
  @IsObject()
  measurements?: object;

  @IsOptional()
  @IsString()
  customerNotes?: string;

  @IsOptional()
  @IsObject()
  shippingAddress?: object;

  @IsOptional()
  @IsString()
  country?: string;
}
