import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Order } from '../orders/entities/order.entity';
import { Design } from '../designs/entities/design.entity';
import { ReadyToWearProduct } from '../ready-to-wear/entities/ready-to-wear-product.entity';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { ReviewPromptsModule } from '../review-prompts/review-prompts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Order, Design, ReadyToWearProduct]),
    LoyaltyModule,
    ReviewPromptsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
