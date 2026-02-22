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
import { RecentlyViewedService } from './recently-viewed.service';
import { RecentlyViewedItemType } from './entities/recently-viewed.entity';

@ApiTags('recently-viewed')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recently-viewed')
export class RecentlyViewedController {
  constructor(
    private readonly recentlyViewedService: RecentlyViewedService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get recently viewed items' })
  getRecentlyViewed(
    @Request() req: RequestWithUser,
    @Query('limit') limit?: string,
  ) {
    return this.recentlyViewedService.getRecentlyViewed(
      req.user.id,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Post(':itemId')
  @ApiOperation({ summary: 'Track an item view' })
  async trackView(
    @Request() req: RequestWithUser,
    @Param('itemId') itemId: string,
    @Query('itemType') itemType?: string,
  ) {
    await this.recentlyViewedService.trackView(
      req.user.id,
      itemId,
      (itemType as RecentlyViewedItemType) || RecentlyViewedItemType.DESIGN,
    );
    return { success: true };
  }

  @Delete()
  @ApiOperation({ summary: 'Clear recently viewed history' })
  async clearHistory(@Request() req: RequestWithUser) {
    await this.recentlyViewedService.clearHistory(req.user.id);
    return { success: true };
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Remove an item from recently viewed' })
  async removeItem(
    @Request() req: RequestWithUser,
    @Param('itemId') itemId: string,
  ) {
    await this.recentlyViewedService.removeItem(req.user.id, itemId);
    return { success: true };
  }
}
