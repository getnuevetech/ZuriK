import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AbandonedCartService } from './abandoned-cart.service';

@Injectable()
export class AbandonedCartCron {
  constructor(private readonly abandonedCartService: AbandonedCartService) {}

  @Cron('0 */30 * * * *')
  async detectCarts(): Promise<void> {
    await this.abandonedCartService.detectAbandonedCarts();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async sendEmails(): Promise<void> {
    await this.abandonedCartService.sendRecoveryEmails();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireOld(): Promise<void> {
    await this.abandonedCartService.expireOld();
  }
}
