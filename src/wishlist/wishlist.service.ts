import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem, WishlistItemType } from './entities/wishlist-item.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistRepo: Repository<WishlistItem>,
  ) {}

  async addToWishlist(userId: string, itemId: string, itemType: WishlistItemType = WishlistItemType.DESIGN): Promise<WishlistItem> {
    const existing = await this.wishlistRepo.findOne({ where: { userId, itemId, itemType } });
    if (existing) return existing;
    const item = this.wishlistRepo.create({ userId, itemId, itemType });
    return this.wishlistRepo.save(item);
  }

  async removeFromWishlist(userId: string, itemId: string): Promise<void> {
    await this.wishlistRepo.delete({ userId, itemId });
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

  async getWishlistItemIds(userId: string): Promise<string[]> {
    const items = await this.wishlistRepo
      .createQueryBuilder('w')
      .select('w.itemId')
      .where('w.userId = :userId', { userId })
      .getMany();
    return items.map((i) => i.itemId);
  }

  async getWishlistCount(userId: string): Promise<number> {
    return this.wishlistRepo.count({ where: { userId } });
  }

  async clearWishlist(userId: string): Promise<void> {
    await this.wishlistRepo.delete({ userId });
  }

  async toggleWishlist(userId: string, itemId: string, itemType: WishlistItemType = WishlistItemType.DESIGN): Promise<{ added: boolean }> {
    const existing = await this.wishlistRepo.findOne({ where: { userId, itemId, itemType } });
    if (existing) {
      await this.wishlistRepo.delete({ userId, itemId, itemType });
      return { added: false };
    }
    const item = this.wishlistRepo.create({ userId, itemId, itemType });
    await this.wishlistRepo.save(item);
    return { added: true };
  }
}
