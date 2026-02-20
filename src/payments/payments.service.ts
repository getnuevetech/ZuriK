import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import type Stripe from 'stripe';
import { PaymentGateway } from './entities/payment-gateway.entity';
import { Payment, PaymentProvider, PaymentStatus } from './entities/payment.entity';
import { Payout, PayoutStatus } from './entities/payout.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { PaystackService } from './providers/paystack.service';
import { StripeService } from './providers/stripe.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(PaymentGateway)
    private readonly gatewayRepo: Repository<PaymentGateway>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Payout)
    private readonly payoutRepo: Repository<Payout>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly paystackService: PaystackService,
    private readonly stripeService: StripeService,
  ) {}

  // ── Gateway management ──────────────────────────────────────────────────────

  async create(dto: CreateGatewayDto): Promise<PaymentGateway> {
    const gateway = this.gatewayRepo.create(dto);
    return this.gatewayRepo.save(gateway);
  }

  async findAll(): Promise<PaymentGateway[]> {
    return this.gatewayRepo.find({ order: { priority: 'DESC' } });
  }

  async update(id: string, dto: Partial<CreateGatewayDto>): Promise<PaymentGateway> {
    const gateway = await this.gatewayRepo.findOne({ where: { id } });
    if (!gateway) throw new NotFoundException(`Gateway ${id} not found`);
    Object.assign(gateway, dto);
    return this.gatewayRepo.save(gateway);
  }

  // ── Payment initiation ──────────────────────────────────────────────────────

  async initiatePayment(
    orderId: string,
    userId: string,
    provider: PaymentProvider,
    callbackUrl?: string,
  ): Promise<{ paymentUrl: string; paymentId: string }> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['customer'],
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    if (order.customer?.id !== userId) throw new ForbiddenException('Access denied');
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException(`Order is not in PENDING_PAYMENT status`);
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const reference = `PAY-${uuidv4()}`;
    const currency = process.env.PAYMENT_DEFAULT_CURRENCY || 'NGN';
    const defaultCallback = process.env.PAYMENT_CALLBACK_URL || 'http://localhost:3000/payments/callback';
    const resolvedCallbackUrl = callbackUrl || defaultCallback;

    const payment = await this.paymentRepo.save(
      this.paymentRepo.create({
        order: { id: orderId },
        amount: order.totalPrice,
        currency,
        provider,
        providerReference: reference,
        status: PaymentStatus.PENDING,
      }),
    );

    let paymentUrl: string;

    if (provider === PaymentProvider.PAYSTACK) {
      const result = await this.paystackService.initializeTransaction(
        user.email,
        Number(order.totalPrice),
        currency,
        reference,
        `${resolvedCallbackUrl}?paymentId=${payment.id}`,
        { paymentId: payment.id, orderId },
      );
      await this.paymentRepo.update(payment.id, { providerTransactionId: result.accessCode });
      paymentUrl = result.authorizationUrl;
    } else if (provider === PaymentProvider.STRIPE) {
      const result = await this.stripeService.createCheckoutSession(
        [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: { name: `Order #${order.orderNumber}` },
              unit_amount: Math.round(Number(order.totalPrice) * 100),
            },
            quantity: 1,
          },
        ],
        currency.toLowerCase(),
        `${resolvedCallbackUrl}?paymentId=${payment.id}&session_id={CHECKOUT_SESSION_ID}`,
        `${resolvedCallbackUrl}?paymentId=${payment.id}&cancelled=true`,
        { paymentId: payment.id, orderId },
      );
      await this.paymentRepo.update(payment.id, { providerTransactionId: result.sessionId });
      paymentUrl = result.url;
    } else {
      throw new BadRequestException('Unsupported payment provider');
    }

    return { paymentUrl, paymentId: payment.id };
  }

  // ── Payment verification ────────────────────────────────────────────────────

  async verifyPayment(paymentId: string, userId: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['order', 'order.customer'],
    });
    if (!payment) throw new NotFoundException(`Payment ${paymentId} not found`);
    if (payment.order?.customer?.id !== userId) throw new ForbiddenException('Access denied');

    if (payment.status !== PaymentStatus.PENDING) return payment;

    try {
      if (payment.provider === PaymentProvider.PAYSTACK) {
        const result = await this.paystackService.verifyTransaction(payment.providerReference);
        if (result.status === 'success') {
          await this.markPaymentSuccess(payment, result.data);
        } else {
          await this.paymentRepo.update(payment.id, { status: PaymentStatus.FAILED });
          payment.status = PaymentStatus.FAILED;
        }
      } else if (payment.provider === PaymentProvider.STRIPE) {
        const session = await this.stripeService.verifySession(payment.providerTransactionId);
        if (session.payment_status === 'paid') {
          await this.markPaymentSuccess(payment, session as unknown as object);
        } else if (session.status === 'expired') {
          await this.paymentRepo.update(payment.id, { status: PaymentStatus.FAILED });
          payment.status = PaymentStatus.FAILED;
        }
      }
    } catch (err) {
      this.logger.error(`Payment verification failed for ${paymentId}`, err);
    }

    const result = await this.paymentRepo.findOne({ where: { id: paymentId }, relations: ['order'] });
    if (!result) throw new NotFoundException(`Payment ${paymentId} not found`);
    return result;
  }

  private async markPaymentSuccess(payment: Payment, providerData: object): Promise<void> {
    const now = new Date();
    await this.paymentRepo.update(payment.id, {
      status: PaymentStatus.SUCCESS,
      paidAt: now,
      metadata: providerData,
    });
    await this.orderRepo.update(payment.order.id, { status: OrderStatus.PAID });
    payment.status = PaymentStatus.SUCCESS;
    payment.paidAt = now;
  }

  // ── Webhooks ────────────────────────────────────────────────────────────────

  async handlePaystackWebhook(body: Buffer, signature: string): Promise<void> {
    if (!this.paystackService.verifyWebhookSignature(body, signature)) {
      throw new BadRequestException('Invalid Paystack webhook signature');
    }
    const event = JSON.parse(body.toString());
    if (event.event === 'charge.success') {
      const reference = event.data?.reference;
      const payment = await this.paymentRepo.findOne({
        where: { providerReference: reference },
        relations: ['order'],
      });
      if (payment && payment.status === PaymentStatus.PENDING) {
        await this.markPaymentSuccess(payment, event.data);
      }
    } else if (event.event === 'charge.failed') {
      const reference = event.data?.reference;
      await this.paymentRepo.update(
        { providerReference: reference },
        { status: PaymentStatus.FAILED, metadata: event.data },
      );
    }
  }

  async handleStripeWebhook(body: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;
    try {
      event = this.stripeService.verifyWebhookSignature(body, signature);
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentId = session.metadata?.paymentId;
      if (paymentId) {
        const payment = await this.paymentRepo.findOne({
          where: { id: paymentId },
          relations: ['order'],
        });
        if (payment && payment.status === PaymentStatus.PENDING) {
          await this.markPaymentSuccess(payment, session as unknown as object);
        }
      }
    }
  }

  // ── Query helpers ───────────────────────────────────────────────────────────

  async getPaymentsByOrder(orderId: string): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { order: { id: orderId } },
      order: { createdAt: 'DESC' },
    });
  }

  // ── Seller payouts ──────────────────────────────────────────────────────────

  async initiateSellerPayout(orderId: string): Promise<Payout[]> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['design', 'design.designer', 'fabric', 'fabric.seller'],
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Order must be DELIVERED before initiating payouts');
    }

    const currency = process.env.PAYMENT_DEFAULT_CURRENCY || 'NGN';
    const payouts: Payout[] = [];

    if (order.designerEarnings && Number(order.designerEarnings) > 0 && order.design?.designer) {
      const payout = await this.payoutRepo.save(
        this.payoutRepo.create({
          user: { id: order.design.designer.id },
          order: { id: orderId },
          amount: order.designerEarnings,
          currency,
          status: PayoutStatus.PENDING,
          provider: 'paystack',
        }),
      );
      payouts.push(payout);
    }

    if (order.fabricSellerEarnings && Number(order.fabricSellerEarnings) > 0 && order.fabric?.seller) {
      const payout = await this.payoutRepo.save(
        this.payoutRepo.create({
          user: { id: order.fabric.seller.id },
          order: { id: orderId },
          amount: order.fabricSellerEarnings,
          currency,
          status: PayoutStatus.PENDING,
          provider: 'paystack',
        }),
      );
      payouts.push(payout);
    }

    return payouts;
  }

  async getPayoutsForUser(userId: string): Promise<Payout[]> {
    return this.payoutRepo.find({
      where: { user: { id: userId } },
      relations: ['order'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllPayouts(): Promise<Payout[]> {
    return this.payoutRepo.find({
      relations: ['user', 'order'],
      order: { createdAt: 'DESC' },
    });
  }
}
