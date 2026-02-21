import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem, CartItemType } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Product } from '../products/entities/product.entity';
import { Fabric } from '../fabrics/entities/fabric.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Fabric)
    private readonly fabricRepo: Repository<Fabric>,
  ) {}

  async getCart(userId: string): Promise<any[]> {
    const items = await this.cartRepo.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    return Promise.all(
      items.map(async (item) => {
        let details: any = null;
        if (item.productId) {
          details = await this.productRepo.findOne({ where: { id: item.productId } });
        } else if (item.fabricId) {
          details = await this.fabricRepo.findOne({ where: { id: item.fabricId } });
        }
        return {
          id: item.id,
          type: item.type,
          quantity: item.quantity,
          productId: item.productId,
          fabricId: item.fabricId,
          name: details?.name ?? null,
          price: details ? Number(details.customerPrice ?? details.sellerPrice) : 0,
          image: details?.images?.[0] ?? null,
          inStock: details ? (details.stock === undefined || details.stock > 0) : false,
          createdAt: item.createdAt,
        };
      }),
    );
  }

  async addToCart(userId: string, dto: AddToCartDto): Promise<CartItem> {
    const qty = dto.quantity ?? 1;

    if (dto.type === CartItemType.READY_TO_WEAR && dto.productId) {
      const product = await this.productRepo.findOne({ where: { id: dto.productId, isActive: true } });
      if (!product) throw new NotFoundException('Product not found or inactive');
      if (product.stock !== undefined && product.stock <= 0) {
        throw new BadRequestException('Product is out of stock');
      }
    } else if (dto.type === CartItemType.FABRIC_ONLY && dto.fabricId) {
      const fabric = await this.fabricRepo.findOne({ where: { id: dto.fabricId, isActive: true } });
      if (!fabric) throw new NotFoundException('Fabric not found or inactive');
      if (fabric.stock <= 0) throw new BadRequestException('Fabric is out of stock');
    }

    const existing = await this.cartRepo.findOne({
      where: {
        userId,
        ...(dto.productId ? { productId: dto.productId } : {}),
        ...(dto.fabricId ? { fabricId: dto.fabricId } : {}),
        type: dto.type,
      },
    });

    if (existing) {
      existing.quantity += qty;
      return this.cartRepo.save(existing);
    }

    const item = this.cartRepo.create({
      userId,
      productId: dto.productId,
      fabricId: dto.fabricId,
      type: dto.type,
      quantity: qty,
    });
    return this.cartRepo.save(item);
  }

  async updateCartItem(userId: string, cartItemId: string, dto: UpdateCartItemDto): Promise<CartItem> {
    const item = await this.cartRepo.findOne({ where: { id: cartItemId, userId } });
    if (!item) throw new NotFoundException('Cart item not found');
    item.quantity = dto.quantity;
    return this.cartRepo.save(item);
  }

  async removeCartItem(userId: string, cartItemId: string): Promise<void> {
    const item = await this.cartRepo.findOne({ where: { id: cartItemId, userId } });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.cartRepo.remove(item);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepo.delete({ userId });
  }

  async getCartSummary(userId: string): Promise<{ items: any[]; subtotal: number; itemCount: number }> {
    const items = await this.getCart(userId);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    return { items, subtotal, itemCount };
  }

  async syncCart(
    userId: string,
    clientItems: Array<{ productId?: string; fabricId?: string; type: CartItemType; quantity: number }>,
  ): Promise<any[]> {
    for (const clientItem of clientItems) {
      await this.addToCart(userId, {
        productId: clientItem.productId,
        fabricId: clientItem.fabricId,
        type: clientItem.type,
        quantity: clientItem.quantity,
      }).catch(() => undefined);
    }
    return this.getCart(userId);
  }
}
