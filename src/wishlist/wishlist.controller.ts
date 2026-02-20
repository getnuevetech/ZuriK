import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WishlistService } from './wishlist.service';
import { RequestWithUser } from '../auth/auth.types';

@ApiTags('wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user wishlist (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getWishlist(
    @Request() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.wishlistService.getWishlist(
      req.user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('ids')
  @ApiOperation({ summary: 'Get product IDs in wishlist' })
  getWishlistIds(@Request() req: RequestWithUser) {
    return this.wishlistService.getWishlistProductIds(req.user.id);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get wishlist item count' })
  async getWishlistCount(@Request() req: RequestWithUser) {
    const count = await this.wishlistService.getWishlistCount(req.user.id);
    return { count };
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Add product to wishlist' })
  addToWishlist(
    @Request() req: RequestWithUser,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.addToWishlist(req.user.id, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  removeFromWishlist(
    @Request() req: RequestWithUser,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.removeFromWishlist(req.user.id, productId);
  }

  @Post(':productId/toggle')
  @ApiOperation({ summary: 'Toggle product in wishlist' })
  toggleWishlist(
    @Request() req: RequestWithUser,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.toggleWishlist(req.user.id, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire wishlist' })
  clearWishlist(@Request() req: RequestWithUser) {
    return this.wishlistService.clearWishlist(req.user.id);
  }
}
