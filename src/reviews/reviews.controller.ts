import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { ReviewStatus } from './entities/review.entity';
import { RequestWithUser } from '../auth/auth.types';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ── Public endpoints ───────────────────────────────────────────────────────

  @Get('products/:productId/reviews')
  getProductReviews(
    @Param('productId') productId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    return this.reviewsService.getProductReviews(
      productId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      sort as any,
    );
  }

  @Get('products/:productId/reviews/summary')
  getRatingSummary(@Param('productId') productId: string) {
    return this.reviewsService.getProductRatingsSummary(productId);
  }

  // ── Auth-required endpoints ────────────────────────────────────────────────

  @Post('products/:productId/reviews')
  @UseGuards(JwtAuthGuard)
  createReview(
    @Param('productId') productId: string,
    @Request() req: RequestWithUser,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(req.user.id, productId, dto);
  }

  @Get('reviews/my')
  @UseGuards(JwtAuthGuard)
  getMyReviews(
    @Request() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.getUserReviews(
      req.user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Patch('reviews/:id')
  @UseGuards(JwtAuthGuard)
  updateReview(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(id, req.user.id, dto);
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard)
  async deleteReview(@Param('id') id: string, @Request() req: RequestWithUser) {
    await this.reviewsService.deleteReview(id, req.user.id);
    return { success: true };
  }

  @Post('reviews/:id/helpful')
  @UseGuards(JwtAuthGuard)
  markHelpful(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.reviewsService.markHelpful(id, req.user.id);
  }

  // ── Admin endpoints ────────────────────────────────────────────────────────

  @Get('admin/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminGetReviews(
    @Query('status') status?: string,
    @Query('productId') productId?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.adminGetReviews(
      {
        status: status as ReviewStatus | undefined,
        productId,
        userId,
        startDate,
        endDate,
      },
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Patch('admin/reviews/:id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminModerateReview(@Param('id') id: string, @Body() dto: ModerateReviewDto) {
    return this.reviewsService.adminModerateReview(id, dto.status, dto.adminNote);
  }
}
