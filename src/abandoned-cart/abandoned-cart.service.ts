import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan, MoreThan } from 'typeorm';
import { AbandonedCart, AbandonedCartStatus } from './entities/abandoned-cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Fabric } from '../fabrics/entities/fabric.entity';
import { EmailService } from '../notifications/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class AbandonedCartService {
  private readonly logger = new Logger(AbandonedCartService.name);

  constructor(
    @InjectRepository(AbandonedCart)
    private readonly abandonedCartRepo: Repository<AbandonedCart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Fabric)
    private readonly fabricRepo: Repository<Fabric>,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async detectAbandonedCarts(): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const staleItems = await this.cartItemRepo
      .createQueryBuilder('item')
      .select('item.userId')
      .addSelect('COUNT(item.id)', 'itemCount')
      .addSelect('MAX(item.updatedAt)', 'lastUpdate')
      .where('item.updatedAt < :oneHourAgo', { oneHourAgo })
      .groupBy('item.userId')
      .having('COUNT(item.id) > 0')
      .getRawMany<{ userId: string; itemCount: string; lastUpdate: Date }>();

    for (const row of staleItems) {
      const existing = await this.abandonedCartRepo.findOne({
        where: {
          userId: row.userId,
          status: In([AbandonedCartStatus.PENDING, AbandonedCartStatus.EMAIL_SENT]),
        },
      });
      if (existing) continue;

      const items = await this.cartItemRepo.find({ where: { userId: row.userId } });
      if (items.length === 0) continue;

      const snapshot: Record<string, any>[] = [];
      let totalValue = 0;
      for (const i of items) {
        let name = 'Item';
        let price = 0;
        if (i.productId) {
          const product = await this.productRepo.findOne({ where: { id: i.productId } });
          if (product) { name = product.name; price = Number(product.customerPrice ?? 0); }
        } else if (i.fabricId) {
          const fabric = await this.fabricRepo.findOne({ where: { id: i.fabricId } });
          if (fabric) { name = fabric.name; price = Number(fabric.sellerPrice ?? 0); }
        }
        totalValue += price * i.quantity;
        snapshot.push({ productId: i.productId, fabricId: i.fabricId, type: i.type, quantity: i.quantity, name, price });
      }

      await this.abandonedCartRepo.save(
        this.abandonedCartRepo.create({
          userId: row.userId,
          cartSnapshot: snapshot,
          totalValue,
          status: AbandonedCartStatus.PENDING,
        }),
      );
    }
    this.logger.log(`Abandoned cart detection complete. Found ${staleItems.length} users with stale carts.`);
  }

  async sendRecoveryEmails(): Promise<void> {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const pendingCarts = await this.abandonedCartRepo
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.user', 'user')
      .where('cart.status = :status', { status: AbandonedCartStatus.PENDING })
      .andWhere('cart.createdAt < :twoHoursAgo', { twoHoursAgo })
      .andWhere('cart.createdAt > :thirtyDaysAgo', { thirtyDaysAgo })
      .getMany();

    for (const cart of pendingCarts) {
      try {
        await this.emailService.sendAbandonedCartReminder(cart.user, {
          items: cart.cartSnapshot,
          totalValue: Number(cart.totalValue),
        });
        await this.notificationsService.create(
          cart.userId,
          NotificationType.ABANDONED_CART,
          'You left something behind!',
          'Your cart is waiting for you.',
          { abandonedCartId: cart.id },
        );
        cart.status = AbandonedCartStatus.EMAIL_SENT;
        cart.emailSentAt = new Date();
        await this.abandonedCartRepo.save(cart);
      } catch (err) {
        this.logger.error(`Failed to send recovery email for cart ${cart.id}: ${(err as Error).message}`);
      }
    }
  }

  async markRecovered(userId: string): Promise<void> {
    const cart = await this.abandonedCartRepo.findOne({
      where: {
        userId,
        status: In([AbandonedCartStatus.PENDING, AbandonedCartStatus.EMAIL_SENT]),
      },
      order: { createdAt: 'DESC' },
    });
    if (!cart) return;
    cart.status = AbandonedCartStatus.RECOVERED;
    cart.recoveredAt = new Date();
    await this.abandonedCartRepo.save(cart);
  }

  async expireOld(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await this.abandonedCartRepo
      .createQueryBuilder()
      .update(AbandonedCart)
      .set({ status: AbandonedCartStatus.EXPIRED })
      .where('status IN (:...statuses)', {
        statuses: [AbandonedCartStatus.PENDING, AbandonedCartStatus.EMAIL_SENT],
      })
      .andWhere('createdAt < :thirtyDaysAgo', { thirtyDaysAgo })
      .execute();
  }

  async getStats() {
    const total = await this.abandonedCartRepo.count();
    const recovered = await this.abandonedCartRepo.count({ where: { status: AbandonedCartStatus.RECOVERED } });
    const recoveryRate = total > 0 ? Math.round((recovered / total) * 100) : 0;

    const recoveredRevenue = await this.abandonedCartRepo
      .createQueryBuilder('cart')
      .select('COALESCE(SUM(cart.totalValue), 0)', 'total')
      .where('cart.status = :status', { status: AbandonedCartStatus.RECOVERED })
      .getRawOne<{ total: string }>();

    return {
      totalAbandoned: total,
      recovered,
      recoveryRate,
      totalRecoveredRevenue: Number(recoveredRevenue?.total ?? 0),
    };
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [carts, total] = await this.abandonedCartRepo.findAndCount({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return { carts, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
