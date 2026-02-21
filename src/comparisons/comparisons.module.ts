import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { ComparisonService } from './comparisons.service';
import { ComparisonController } from './comparisons.controller';

@Module({
  imports: [ProductsModule],
  controllers: [ComparisonController],
  providers: [ComparisonService],
})
export class ComparisonsModule {}
