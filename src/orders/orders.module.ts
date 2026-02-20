import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { OrdersController, QaController } from './orders.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';
import { TaxesModule } from '../taxes/taxes.module';
import { Product } from '../products/entities/product.entity';
import { Fabric } from '../fabrics/entities/fabric.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Product, Fabric, User]),
    NotificationsModule,
    SettingsModule,
    TaxesModule,
  ],
  controllers: [OrdersController, QaController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
