import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadyToWearProduct } from './entities/ready-to-wear-product.entity';
import { ReadyToWearService } from './ready-to-wear.service';
import { ReadyToWearController } from './ready-to-wear.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReadyToWearProduct])],
  controllers: [ReadyToWearController],
  providers: [ReadyToWearService],
  exports: [ReadyToWearService, TypeOrmModule],
})
export class ReadyToWearModule {}
