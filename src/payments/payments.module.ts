import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentGateway } from './entities/payment-gateway.entity';
import { Payment } from './entities/payment.entity';
import { Payout } from './entities/payout.entity';
import { Order } from '../orders/entities/order.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaystackService } from './providers/paystack.service';
import { StripeService } from './providers/stripe.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([PaymentGateway, Payment, Payout, Order]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaystackService, StripeService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
