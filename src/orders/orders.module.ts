import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { OrdersController, QaController } from './orders.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';
import { TaxesModule } from '../taxes/taxes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    NotificationsModule,
    SettingsModule,
    TaxesModule,
  ],
  controllers: [OrdersController, QaController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
