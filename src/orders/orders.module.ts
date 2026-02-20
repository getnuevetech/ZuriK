import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { FabricSellerOrder } from './entities/fabric-seller-order.entity';
import { DesignerOrder } from './entities/designer-order.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Product } from '../products/entities/product.entity';
import { Fabric } from '../fabrics/entities/fabric.entity';
import { Measurement } from '../measurements/entities/measurement.entity';
import { User } from '../users/entities/user.entity';
import { SettingsModule } from '../settings/settings.module';
import { TaxesModule } from '../taxes/taxes.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, FabricSellerOrder, DesignerOrder, Product, Fabric, Measurement, User]),
    SettingsModule,
    TaxesModule,
    NotificationsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
