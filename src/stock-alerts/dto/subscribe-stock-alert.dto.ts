import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StockAlertProductType } from '../entities/stock-alert.entity';

export class SubscribeStockAlertDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty({ enum: StockAlertProductType })
  @IsEnum(StockAlertProductType)
  productType: StockAlertProductType;
}
