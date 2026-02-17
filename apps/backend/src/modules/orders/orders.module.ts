import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderSplittingService } from './order-splitting.service';
import { Order } from '../../database/entities/order.entity';
import { User } from '../../database/entities/user.entity';
import { Design } from '../../database/entities/design.entity';
import { Fabric } from '../../database/entities/fabric.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User, Design, Fabric]),
    ConfigModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderSplittingService],
  exports: [OrdersService],
})
export class OrdersModule {}
