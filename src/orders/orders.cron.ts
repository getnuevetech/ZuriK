import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';

@Injectable()
export class OrdersCron {
  private readonly logger = new Logger(OrdersCron.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async autoCloseDeliveredOrders(): Promise<void> {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const result = await this.orderRepo
      .createQueryBuilder()
      .update(Order)
      .set({ status: OrderStatus.CLOSED })
      .where('status = :status', { status: OrderStatus.DELIVERED })
      .andWhere('updatedAt < :cutoff', { cutoff: threeDaysAgo })
      .execute();

    if (result.affected && result.affected > 0) {
      this.logger.log(`Auto-closed ${result.affected} delivered order(s) older than 3 days`);
    }
  }
}
