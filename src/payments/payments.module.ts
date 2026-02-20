import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentGateway } from './entities/payment-gateway.entity';
import { Payment } from './entities/payment.entity';
import { Payout } from './entities/payout.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController, CustomerPaymentsController, AdminPayoutsController } from './payments.controller';
import { PaystackService } from './providers/paystack.service';
import { StripeService } from './providers/stripe.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentGateway, Payment, Payout, Order, User])],
  controllers: [PaymentsController, CustomerPaymentsController, AdminPayoutsController],
  providers: [PaymentsService, PaystackService, StripeService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
