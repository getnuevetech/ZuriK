import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/auth.types';
import { RecentlyViewedService } from './recently-viewed.service';
import { ProductsService } from '../products/products.service';

@ApiTags('recently-viewed')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recently-viewed')
export class RecentlyViewedController {
  constructor(
    private readonly recentlyViewedService: RecentlyViewedService,
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get recently viewed products' })
  getRecentlyViewed(
    @Request() req: RequestWithUser,
    @Query('limit') limit?: string,
  ) {
    return this.recentlyViewedService.getRecentlyViewed(
      req.user.id,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Track a product view' })
  async trackView(
    @Request() req: RequestWithUser,
    @Param('productId') productId: string,
  ) {
    const product = await this.productsService.findOne(productId).catch(() => null);
    if (!product) throw new NotFoundException(`Product ${productId} not found`);
    await this.recentlyViewedService.trackView(req.user.id, productId);
    return { success: true };
  }

  @Delete()
  @ApiOperation({ summary: 'Clear recently viewed history' })
  async clearHistory(@Request() req: RequestWithUser) {
    await this.recentlyViewedService.clearHistory(req.user.id);
    return { success: true };
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove a product from recently viewed' })
  async removeItem(
    @Request() req: RequestWithUser,
    @Param('productId') productId: string,
  ) {
    await this.recentlyViewedService.removeItem(req.user.id, productId);
    return { success: true };
  }
}
