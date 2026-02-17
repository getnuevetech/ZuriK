import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsObject, IsString, ValidateNested, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../database/entities/order.entity';

class OrderItemDto {
  @ApiProperty({ example: 'design', enum: ['design', 'fabric'] })
  @IsString()
  type: 'design' | 'fabric';

  @ApiProperty({ example: 'uuid-here' })
  @IsString()
  itemId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

class ShippingAddressDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '+234123456789' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  addressLine1: string;

  @ApiProperty({ example: 'Apt 4B', required: false })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @ApiProperty({ example: 'Lagos' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Lagos State' })
  @IsString()
  state: string;

  @ApiProperty({ example: 'Nigeria' })
  @IsString()
  country: string;

  @ApiProperty({ example: '100001' })
  @IsString()
  postalCode: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ type: ShippingAddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CARD })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 'Please use eco-friendly packaging', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
