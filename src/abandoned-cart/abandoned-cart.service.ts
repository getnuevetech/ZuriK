import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { AbandonedCart, AbandonedCartStatus } from './entities/abandoned-cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { User } from '../users/entities/user.entity';
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

      const snapshot = items.map((i) => ({
        productId: i.productId,
        fabricId: i.fabricId,
        type: i.type,
        quantity: i.quantity,
        name: i.productId ?? i.fabricId ?? 'Item',
        price: 0,
      }));

      await this.abandonedCartRepo.save(
        this.abandonedCartRepo.create({
          userId: row.userId,
          cartSnapshot: snapshot,
          totalValue: 0,
          status: AbandonedCartStatus.PENDING,
        }),
      );
    }
    this.logger.log(`Abandoned cart detection complete. Found ${staleItems.length} users with stale carts.`);
  }

  async sendRecoveryEmails(): Promise<void> {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const pendingCarts = await this.abandonedCartRepo.find({
      where: {
        status: AbandonedCartStatus.PENDING,
        createdAt: LessThan(twoHoursAgo),
      },
      relations: ['user'],
    });

    for (const cart of pendingCarts) {
      if (cart.createdAt < thirtyDaysAgo) continue;
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
