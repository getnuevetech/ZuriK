import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { LoyaltyTransaction, LoyaltyTransactionType } from './entities/loyalty-transaction.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

const DEFAULT_POINTS_PER_DOLLAR = 1;
const DEFAULT_POINTS_REDEMPTION_RATE = 100; // points per $1

@Injectable()
export class LoyaltyService {
  private readonly pointsPerDollar: number;
  private readonly pointsRedemptionRate: number;

  constructor(
    @InjectRepository(LoyaltyTransaction)
    private readonly txRepo: Repository<LoyaltyTransaction>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {
    this.pointsPerDollar = this.configService.get<number>('LOYALTY_POINTS_PER_DOLLAR') ?? DEFAULT_POINTS_PER_DOLLAR;
    this.pointsRedemptionRate = this.configService.get<number>('LOYALTY_POINTS_REDEMPTION_RATE') ?? DEFAULT_POINTS_REDEMPTION_RATE;
  }

  async earnPoints(
    userId: string,
    points: number,
    type: LoyaltyTransactionType,
    description: string,
    referenceId?: string,
  ): Promise<LoyaltyTransaction> {
    const tx = await this.txRepo.save(
      this.txRepo.create({ userId, points, type, description, referenceId: referenceId ?? null }),
    );
    await this.userRepo.increment({ id: userId }, 'loyaltyPoints', points);
    await this.notificationsService.create(
      userId,
      NotificationType.LOYALTY_POINTS_EARNED,
      `You earned ${points} loyalty points!`,
      description,
      { points, type },
    );
    return tx;
  }

  async redeemPoints(userId: string, points: number, description: string, referenceId?: string): Promise<LoyaltyTransaction> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || user.loyaltyPoints < points) {
      throw new BadRequestException('Insufficient loyalty points');
    }
    const tx = await this.txRepo.save(
      this.txRepo.create({
        userId,
        points: -points,
        type: LoyaltyTransactionType.REDEEMED,
        description,
        referenceId: referenceId ?? null,
      }),
    );
    await this.userRepo.decrement({ id: userId }, 'loyaltyPoints', points);
    await this.notificationsService.create(
      userId,
      NotificationType.LOYALTY_POINTS_REDEEMED,
      `You redeemed ${points} loyalty points`,
      description,
      { points },
    );
    return tx;
  }

  async getBalance(userId: string): Promise<{ points: number; dollarValue: number }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const points = user?.loyaltyPoints ?? 0;
    return { points, dollarValue: this.getPointsValue(points) };
  }

  async getHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await this.txRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  getPointsValue(points: number): number {
    return Math.round((points / this.pointsRedemptionRate) * 100) / 100;
  }

  getPointsForPurchase(totalPrice: number): number {
    return Math.floor(totalPrice) * this.pointsPerDollar;
  }
}
