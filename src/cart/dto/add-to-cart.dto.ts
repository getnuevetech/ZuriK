import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CartItemType } from '../entities/cart-item.entity';

export class AddToCartDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fabricId?: string;

  @ApiProperty({ enum: CartItemType })
  @IsEnum(CartItemType)
  type: CartItemType;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
