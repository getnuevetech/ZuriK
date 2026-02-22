import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecentlyViewed, RecentlyViewedItemType } from './entities/recently-viewed.entity';

@Injectable()
export class RecentlyViewedService {
  constructor(
    @InjectRepository(RecentlyViewed)
    private readonly recentlyViewedRepo: Repository<RecentlyViewed>,
  ) {}

  async trackView(userId: string, itemId: string, itemType: RecentlyViewedItemType = RecentlyViewedItemType.DESIGN): Promise<void> {
    const existing = await this.recentlyViewedRepo.findOne({
      where: { userId, itemId, itemType },
    });
    if (existing) {
      await this.recentlyViewedRepo.save(existing);
    } else {
      const record = this.recentlyViewedRepo.create({ userId, itemId, itemType });
      await this.recentlyViewedRepo.save(record);
    }
  }

  async getRecentlyViewed(userId: string, limit = 10): Promise<RecentlyViewed[]> {
    return this.recentlyViewedRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
      take: limit,
    });
  }

  async clearHistory(userId: string): Promise<void> {
    await this.recentlyViewedRepo.delete({ userId });
  }

  async removeItem(userId: string, itemId: string): Promise<void> {
    await this.recentlyViewedRepo.delete({ userId, itemId });
  }
}
