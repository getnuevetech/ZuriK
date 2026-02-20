import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistItem } from './entities/wishlist-item.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private wishlistRepo: Repository<WishlistItem>,
  ) {}

  async addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
    const existing = await this.wishlistRepo.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });
    if (existing) return existing;
    const item = this.wishlistRepo.create({
      user: { id: userId } as any,
      product: { id: productId } as any,
    });
    return this.wishlistRepo.save(item);
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    await this.wishlistRepo.delete({
      user: { id: userId },
      product: { id: productId },
    });
  }

  async getWishlist(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.wishlistRepo.findAndCount({
      where: { user: { id: userId } },
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

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const count = await this.wishlistRepo.count({
      where: { user: { id: userId }, product: { id: productId } },
    });
    return count > 0;
  }

  async getWishlistProductIds(userId: string): Promise<string[]> {
    const items = await this.wishlistRepo
      .createQueryBuilder('item')
      .innerJoin('item.product', 'product')
      .select('product.id', 'productId')
      .where('item.userId = :userId', { userId })
      .getRawMany();
    return items.map((row) => row.productId);
  }

  async getWishlistCount(userId: string): Promise<number> {
    return this.wishlistRepo.count({ where: { user: { id: userId } } });
  }

  async clearWishlist(userId: string): Promise<void> {
    await this.wishlistRepo.delete({ user: { id: userId } });
  }

  async toggleWishlist(userId: string, productId: string): Promise<{ added: boolean }> {
    const inWishlist = await this.isInWishlist(userId, productId);
    if (inWishlist) {
      await this.removeFromWishlist(userId, productId);
      return { added: false };
    } else {
      await this.addToWishlist(userId, productId);
      return { added: true };
    }
  }
}
