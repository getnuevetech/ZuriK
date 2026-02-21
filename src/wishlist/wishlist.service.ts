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
      relations: ['product', 'product.designer'],
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

  async getWishlistProductIds(userId: string): Promise<string[]> {
    const items = await this.wishlistRepo
      .createQueryBuilder('w')
      .select('w.productId')
      .where('w.userId = :userId', { userId })
      .getMany();
    return items.map((i) => i.productId);
  }

  async getWishlistCount(userId: string): Promise<number> {
    return this.wishlistRepo.count({ where: { userId } });
  }

  async clearWishlist(userId: string): Promise<void> {
    await this.wishlistRepo.delete({ userId });
  }

  async toggleWishlist(userId: string, productId: string): Promise<{ added: boolean }> {
    const existing = await this.wishlistRepo.findOne({ where: { userId, productId } });
    if (existing) {
      await this.wishlistRepo.delete({ userId, productId });
      return { added: false };
    }
    const item = this.wishlistRepo.create({ userId, productId });
    await this.wishlistRepo.save(item);
    return { added: true };
  }
}
