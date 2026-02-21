import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockAlert, StockAlertStatus, StockAlertProductType } from './entities/stock-alert.entity';
import { EmailService } from '../notifications/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class StockAlertsService {
  private readonly logger = new Logger(StockAlertsService.name);

  constructor(
    @InjectRepository(StockAlert)
    private readonly alertRepo: Repository<StockAlert>,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async subscribe(userId: string, productId: string, productType: StockAlertProductType): Promise<StockAlert> {
    const existing = await this.alertRepo.findOne({ where: { userId, productId } });
    if (existing) {
      if (existing.status === StockAlertStatus.CANCELLED) {
        existing.status = StockAlertStatus.ACTIVE;
        existing.notifiedAt = null;
        return this.alertRepo.save(existing);
      }
      return existing;
    }
    return this.alertRepo.save(this.alertRepo.create({ userId, productId, productType, status: StockAlertStatus.ACTIVE }));
  }

  async unsubscribe(userId: string, productId: string): Promise<void> {
    const alert = await this.alertRepo.findOne({ where: { userId, productId } });
    if (alert) {
      alert.status = StockAlertStatus.CANCELLED;
      await this.alertRepo.save(alert);
    }
  }

  async getMyAlerts(userId: string): Promise<StockAlert[]> {
    return this.alertRepo.find({ where: { userId, status: StockAlertStatus.ACTIVE } });
  }

  async notifyBackInStock(productId: string, productType: StockAlertProductType, productName: string, frontendUrl: string): Promise<void> {
    const alerts = await this.alertRepo.find({
      where: { productId, status: StockAlertStatus.ACTIVE },
      relations: ['user'],
    });

    const productUrl = `${frontendUrl}/${productType === StockAlertProductType.PRODUCT ? 'products' : 'fabrics'}/${productId}`;

    for (const alert of alerts) {
      try {
        await this.emailService.sendBackInStockAlert(alert.user, productName, productUrl);
        await this.notificationsService.create(
          alert.userId,
          NotificationType.BACK_IN_STOCK,
          `${productName} is back in stock!`,
          `The item you subscribed to is now available.`,
          { productId, productType },
        );
        alert.status = StockAlertStatus.NOTIFIED;
        alert.notifiedAt = new Date();
        await this.alertRepo.save(alert);
      } catch (err) {
        this.logger.error(`Failed to notify user ${alert.userId} for stock alert: ${(err as Error).message}`);
      }
    }
  }

  async getAlertCount(productId: string): Promise<number> {
    return this.alertRepo.count({ where: { productId, status: StockAlertStatus.ACTIVE } });
  }
}
