import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from './entities/wishlist-item.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistRepo: Repository<WishlistItem>,
  ) {}

  async addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
    const existing = await this.wishlistRepo.findOne({ where: { userId, productId } });
    if (existing) return existing;
    const item = this.wishlistRepo.create({ userId, productId });
    return this.wishlistRepo.save(item);
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    await this.wishlistRepo.delete({ userId, productId });
  }

  async getWishlist(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.wishlistRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const count = await this.wishlistRepo.count({ where: { userId, productId } });
    return count > 0;
  }

  async getWishlistProductIds(userId: string): Promise<string[]> {
    const rows = await this.wishlistRepo
      .createQueryBuilder('wi')
      .select('wi.productId')
      .where('wi.userId = :userId', { userId })
      .getRawMany();
    return rows.map((r) => r.wi_productId);
  }

  async getWishlistCount(userId: string): Promise<number> {
    return this.wishlistRepo.count({ where: { userId } });
  }

  async clearWishlist(userId: string): Promise<void> {
    await this.wishlistRepo.delete({ userId });
  }

  async toggleWishlist(userId: string, productId: string): Promise<{ added: boolean }> {
    const exists = await this.isInWishlist(userId, productId);
    if (exists) {
      await this.removeFromWishlist(userId, productId);
      return { added: false };
    }
    await this.addToWishlist(userId, productId);
    return { added: true };
  }
}
