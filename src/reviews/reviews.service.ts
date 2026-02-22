import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus, ReviewItemType } from './entities/review.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Design } from '../designs/entities/design.entity';
import { ReadyToWearProduct } from '../ready-to-wear/entities/ready-to-wear-product.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { LoyaltyTransactionType } from '../loyalty/entities/loyalty-transaction.entity';
import { ReviewPromptsService } from '../review-prompts/review-prompts.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Design)
    private readonly designRepo: Repository<Design>,
    @InjectRepository(ReadyToWearProduct)
    private readonly rtwRepo: Repository<ReadyToWearProduct>,
    private readonly loyaltyService: LoyaltyService,
    private readonly reviewPromptsService: ReviewPromptsService,
  ) {}

  async createReview(userId: string, itemId: string, itemType: ReviewItemType, dto: CreateReviewDto): Promise<Review> {
    const existing = await this.reviewRepo.findOne({
      where: { userId, itemId, itemType },
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this item');
    }

    // Check for a delivered order
    const deliveredOrder = await this.orderRepo.findOne({
      where: {
        customer: { id: userId },
        status: OrderStatus.DELIVERED,
        ...(itemType === ReviewItemType.DESIGN ? { design: { id: itemId } } : {}),
        ...(itemType === ReviewItemType.READY_TO_WEAR ? { readyToWearProduct: { id: itemId } } : {}),
        ...(itemType === ReviewItemType.FABRIC ? { fabric: { id: itemId } } : {}),
      },
    });

    const review = this.reviewRepo.create({
      ...dto,
      userId,
      itemId,
      itemType,
      orderId: deliveredOrder?.id ?? undefined,
      isVerifiedPurchase: !!deliveredOrder,
      status: ReviewStatus.PENDING,
      images: dto.images ?? [],
    });

    const saved = await this.reviewRepo.save(review) as Review;

    await this.reviewPromptsService.markReviewed(userId, itemId);
    await this.loyaltyService.earnPoints(
      userId,
      50,
      LoyaltyTransactionType.EARNED_REVIEW,
      'Points earned for submitting a review',
      saved.id,
    );

    return saved;
  }

  async getItemReviews(
    itemId: string,
    page = 1,
    limit = 10,
    sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful' = 'newest',
  ) {
    const skip = (page - 1) * limit;

    const orderMap: Record<string, Record<string, 'ASC' | 'DESC'>> = {
      newest: { 'review.createdAt': 'DESC' },
      oldest: { 'review.createdAt': 'ASC' },
      highest: { 'review.rating': 'DESC' },
      lowest: { 'review.rating': 'ASC' },
      helpful: { 'review.helpfulCount': 'DESC' },
    };

    const order = orderMap[sortBy] ?? orderMap.newest;

    const [reviews, total] = await this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.itemId = :itemId', { itemId })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED })
      .orderBy(order)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getItemRatingsSummary(itemId: string) {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.itemId = :itemId', { itemId })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED })
      .groupBy('review.rating')
      .getRawMany<{ rating: string; count: string }>();

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalReviews = 0;
    let ratingSum = 0;

    for (const row of result) {
      const rating = parseInt(row.rating, 10);
      const count = parseInt(row.count, 10);
      ratingDistribution[rating] = count;
      totalReviews += count;
      ratingSum += rating * count;
    }

    const averageRating = totalReviews > 0 ? Math.round((ratingSum / totalReviews) * 10) / 10 : 0;

    return { averageRating, totalReviews, ratingDistribution };
  }

  async getUserReviews(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await this.reviewRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateReview(reviewId: string, userId: string, dto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException(`Review ${reviewId} not found`);
    if (review.userId !== userId) throw new ForbiddenException('You can only edit your own reviews');

    Object.assign(review, dto);
    review.status = ReviewStatus.PENDING;
    return this.reviewRepo.save(review);
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException(`Review ${reviewId} not found`);
    if (review.userId !== userId) throw new ForbiddenException('You can only delete your own reviews');
    const { itemId, itemType } = review;
    await this.reviewRepo.remove(review);
    await this.recalculateItemRatings(itemId, itemType);
  }

  async markHelpful(reviewId: string, userId: string): Promise<Review> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException(`Review ${reviewId} not found`);
    if (review.helpfulBy.includes(userId)) {
      throw new BadRequestException('You have already marked this review as helpful');
    }
    review.helpfulBy = [...review.helpfulBy, userId];
    review.helpfulCount = review.helpfulBy.length;
    return this.reviewRepo.save(review);
  }

  async adminGetReviews(
    filters: { status?: ReviewStatus; itemId?: string; userId?: string; startDate?: string; endDate?: string },
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const qb = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .orderBy('review.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters.status) qb.andWhere('review.status = :status', { status: filters.status });
    if (filters.itemId) qb.andWhere('review.itemId = :itemId', { itemId: filters.itemId });
    if (filters.userId) qb.andWhere('review.userId = :userId', { userId: filters.userId });
    if (filters.startDate) qb.andWhere('review.createdAt >= :startDate', { startDate: filters.startDate });
    if (filters.endDate) qb.andWhere('review.createdAt <= :endDate', { endDate: filters.endDate });

    const [reviews, total] = await qb.getManyAndCount();
    return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async adminModerateReview(reviewId: string, status: ReviewStatus, adminNote?: string): Promise<Review> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException(`Review ${reviewId} not found`);
    review.status = status;
    review.adminNote = adminNote ?? null;
    const saved = await this.reviewRepo.save(review);
    await this.recalculateItemRatings(review.itemId, review.itemType);
    return saved;
  }

  async getAverageRating(itemId: string): Promise<number> {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.itemId = :itemId', { itemId })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED })
      .getRawOne<{ avg: string | null }>();
    if (!result?.avg) return 0;
    return Math.round(parseFloat(result.avg) * 10) / 10;
  }

  private async recalculateItemRatings(itemId: string, itemType: ReviewItemType): Promise<void> {
    const summary = await this.getItemRatingsSummary(itemId);
    if (itemType === ReviewItemType.DESIGN) {
      await this.designRepo.update(itemId, {
        averageRating: summary.averageRating,
        totalReviews: summary.totalReviews,
      });
    } else if (itemType === ReviewItemType.READY_TO_WEAR) {
      await this.rtwRepo.update(itemId, {
        averageRating: summary.averageRating,
        totalReviews: summary.totalReviews,
      });
    }
  }
}
