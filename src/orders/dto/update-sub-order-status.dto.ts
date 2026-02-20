import { IsString, IsEnum } from 'class-validator';

export class UpdateSubOrderStatusDto {
  @IsEnum(['pending', 'processing', 'shipped', 'delivered'])
  status: string;
}

export class UpdateDesignerSubOrderStatusDto {
  @IsEnum(['awaiting_fabric', 'fabric_received', 'in_production', 'shipped_to_qa', 'completed'])
  status: string;
}
