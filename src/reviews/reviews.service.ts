import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from './entities/review.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async createReview(userId: string, productId: string, dto: CreateReviewDto): Promise<Review> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    const existing = await this.reviewRepo.findOne({
      where: { userId, productId },
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this product');
    }

    // Check for a delivered order containing this product
    const deliveredOrder = await this.orderRepo.findOne({
      where: {
        customer: { id: userId },
        design: { id: productId },
        status: OrderStatus.DELIVERED,
      },
    });

    const review = this.reviewRepo.create({
      ...dto,
      userId,
      productId,
      orderId: deliveredOrder?.id ?? undefined,
      isVerifiedPurchase: !!deliveredOrder,
      status: ReviewStatus.PENDING,
      images: dto.images ?? [],
    });

    const saved = await this.reviewRepo.save(review) as Review;
    await this.recalculateProductRatings(productId);
    return saved;
  }

  async getProductReviews(
    productId: string,
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
      .where('review.productId = :productId', { productId })
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

  async getProductRatingsSummary(productId: string) {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.productId = :productId', { productId })
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
      relations: ['product'],
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
    const saved = await this.reviewRepo.save(review);
    await this.recalculateProductRatings(review.productId);
    return saved;
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException(`Review ${reviewId} not found`);
    if (review.userId !== userId) throw new ForbiddenException('You can only delete your own reviews');
    const productId = review.productId;
    await this.reviewRepo.remove(review);
    await this.recalculateProductRatings(productId);
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
    filters: { status?: ReviewStatus; productId?: string; userId?: string; startDate?: string; endDate?: string },
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const qb = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .orderBy('review.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters.status) qb.andWhere('review.status = :status', { status: filters.status });
    if (filters.productId) qb.andWhere('review.productId = :productId', { productId: filters.productId });
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
    await this.recalculateProductRatings(review.productId);
    return saved;
  }

  async getAverageRating(productId: string): Promise<number> {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.productId = :productId', { productId })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED })
      .getRawOne<{ avg: string | null }>();
    if (!result?.avg) return 0;
    return Math.round(parseFloat(result.avg) * 10) / 10;
  }

  private async recalculateProductRatings(productId: string): Promise<void> {
    const summary = await this.getProductRatingsSummary(productId);
    await this.productRepo.update(productId, {
      averageRating: summary.averageRating,
      totalReviews: summary.totalReviews,
    });
  }
}
