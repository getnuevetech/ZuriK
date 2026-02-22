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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/auth.types';
import { WishlistService } from './wishlist.service';
import { WishlistItemType } from './entities/wishlist-item.entity';

@ApiTags('wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get wishlist' })
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
  @ApiOperation({ summary: 'Get wishlist item IDs' })
  getWishlistIds(@Request() req: RequestWithUser) {
    return this.wishlistService.getWishlistItemIds(req.user.id);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get wishlist count' })
  async getWishlistCount(@Request() req: RequestWithUser) {
    const count = await this.wishlistService.getWishlistCount(req.user.id);
    return { count };
  }

  @Post(':itemId')
  @ApiOperation({ summary: 'Add item to wishlist' })
  addToWishlist(
    @Request() req: RequestWithUser,
    @Param('itemId') itemId: string,
    @Query('itemType') itemType?: string,
  ) {
    return this.wishlistService.addToWishlist(
      req.user.id,
      itemId,
      (itemType as WishlistItemType) || WishlistItemType.DESIGN,
    );
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Remove item from wishlist' })
  async removeFromWishlist(
    @Request() req: RequestWithUser,
    @Param('itemId') itemId: string,
  ) {
    await this.wishlistService.removeFromWishlist(req.user.id, itemId);
    return { success: true };
  }

  @Post(':itemId/toggle')
  @ApiOperation({ summary: 'Toggle item in wishlist' })
  toggleWishlist(
    @Request() req: RequestWithUser,
    @Param('itemId') itemId: string,
    @Query('itemType') itemType?: string,
  ) {
    return this.wishlistService.toggleWishlist(
      req.user.id,
      itemId,
      (itemType as WishlistItemType) || WishlistItemType.DESIGN,
    );
  }

  @Delete()
  @ApiOperation({ summary: 'Clear wishlist' })
  async clearWishlist(@Request() req: RequestWithUser) {
    await this.wishlistService.clearWishlist(req.user.id);
    return { success: true };
  }
}
