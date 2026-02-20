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
import { RequestWithUser } from '../auth/auth.types';
import { WishlistService } from './wishlist.service';

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
  async getWishlistIds(@Request() req: RequestWithUser) {
    const ids = await this.wishlistService.getWishlistProductIds(req.user.id);
    return { ids };
  }

  @Get('count')
  @ApiOperation({ summary: 'Get wishlist item count' })
  async getWishlistCount(@Request() req: RequestWithUser) {
    const count = await this.wishlistService.getWishlistCount(req.user.id);
    return { count };
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Add product to wishlist' })
  addToWishlist(@Param('productId') productId: string, @Request() req: RequestWithUser) {
    return this.wishlistService.addToWishlist(req.user.id, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  async removeFromWishlist(@Param('productId') productId: string, @Request() req: RequestWithUser) {
    await this.wishlistService.removeFromWishlist(req.user.id, productId);
    return { success: true };
  }

  @Post(':productId/toggle')
  @ApiOperation({ summary: 'Toggle product in wishlist' })
  toggleWishlist(@Param('productId') productId: string, @Request() req: RequestWithUser) {
    return this.wishlistService.toggleWishlist(req.user.id, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire wishlist' })
  async clearWishlist(@Request() req: RequestWithUser) {
    await this.wishlistService.clearWishlist(req.user.id);
    return { success: true };
  }
}
