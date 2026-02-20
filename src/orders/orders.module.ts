import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Product } from '../product.entity';
import { Fabric } from '../fabric.entity';
import { Measurement } from '../measurements/entities/measurement.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, Fabric, Measurement])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
