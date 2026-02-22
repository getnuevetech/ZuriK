import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AbandonedCart } from './entities/abandoned-cart.entity';
import { AbandonedCartService } from './abandoned-cart.service';
import { AbandonedCartCron } from './abandoned-cart.cron';
import { AbandonedCartController } from './abandoned-cart.controller';
import { CartItem } from '../cart/entities/cart-item.entity';
import { User } from '../users/entities/user.entity';
import { ReadyToWearProduct } from '../ready-to-wear/entities/ready-to-wear-product.entity';
import { Fabric } from '../fabrics/entities/fabric.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AbandonedCart, CartItem, User, ReadyToWearProduct, Fabric]),
    ScheduleModule.forRoot(),
    NotificationsModule,
  ],
  controllers: [AbandonedCartController],
  providers: [AbandonedCartService, AbandonedCartCron],
  exports: [AbandonedCartService],
})
export class AbandonedCartModule {}
