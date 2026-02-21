import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { ReviewPromptsModule } from '../review-prompts/review-prompts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Order, Product]),
    LoyaltyModule,
    ReviewPromptsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
