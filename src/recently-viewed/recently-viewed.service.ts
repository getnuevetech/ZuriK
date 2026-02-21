import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecentlyViewed } from './entities/recently-viewed.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class RecentlyViewedService {
  constructor(
    @InjectRepository(RecentlyViewed)
    private readonly recentlyViewedRepo: Repository<RecentlyViewed>,
  ) {}

  async trackView(userId: string, productId: string): Promise<void> {
    const existing = await this.recentlyViewedRepo.findOne({
      where: { userId, productId },
    });
    if (existing) {
      await this.recentlyViewedRepo.save(existing);
    } else {
      const record = this.recentlyViewedRepo.create({ userId, productId });
      await this.recentlyViewedRepo.save(record);
    }
  }

  async getRecentlyViewed(userId: string, limit = 10): Promise<Product[]> {
    const records = await this.recentlyViewedRepo.find({
      where: { userId },
      relations: ['product', 'product.designer'],
      order: { updatedAt: 'DESC' },
      take: limit,
    });
    return records.map((r) => r.product).filter(Boolean);
  }

  async clearHistory(userId: string): Promise<void> {
    await this.recentlyViewedRepo.delete({ userId });
  }

  async removeItem(userId: string, productId: string): Promise<void> {
    await this.recentlyViewedRepo.delete({ userId, productId });
  }
}
