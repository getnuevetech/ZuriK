import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Design } from '../designs/entities/design.entity';
import { ReadyToWearProduct } from '../ready-to-wear/entities/ready-to-wear-product.entity';
import { ComparisonService } from './comparisons.service';
import { ComparisonController } from './comparisons.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Design, ReadyToWearProduct])],
  controllers: [ComparisonController],
  providers: [ComparisonService],
})
export class ComparisonsModule {}
