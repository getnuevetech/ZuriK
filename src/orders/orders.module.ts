import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Order } from './entities/order.entity';
import { FabricSellerOrder } from './entities/fabric-seller-order.entity';
import { DesignerOrder } from './entities/designer-order.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersCron } from './orders.cron';
import { Design } from '../designs/entities/design.entity';
import { ReadyToWearProduct } from '../ready-to-wear/entities/ready-to-wear-product.entity';
import { Fabric } from '../fabrics/entities/fabric.entity';
import { Measurement } from '../measurements/entities/measurement.entity';
import { User } from '../users/entities/user.entity';
import { SettingsModule } from '../settings/settings.module';
import { TaxesModule } from '../taxes/taxes.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { ReviewPromptsModule } from '../review-prompts/review-prompts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, FabricSellerOrder, DesignerOrder, Design, ReadyToWearProduct, Fabric, Measurement, User]),
    ScheduleModule.forRoot(),
    SettingsModule,
    TaxesModule,
    NotificationsModule,
    LoyaltyModule,
    ReviewPromptsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersCron],
  exports: [OrdersService],
})
export class OrdersModule {}
