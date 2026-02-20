import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { DesignerOrder } from '../orders/entities/designer-order.entity';
import { FabricSellerOrder } from '../orders/entities/fabric-seller-order.entity';
import { SettingsModule } from '../settings/settings.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order, DesignerOrder, FabricSellerOrder]),
    SettingsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
