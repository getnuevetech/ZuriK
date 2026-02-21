import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingCarrier } from './entities/shipping-carrier.entity';
import { ShippingMethod } from './entities/shipping-method.entity';
import { ShipmentTracking } from './entities/shipment-tracking.entity';
import { TrackingEvent } from './entities/tracking-event.entity';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingCarrier, ShippingMethod, ShipmentTracking, TrackingEvent, Order])],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
