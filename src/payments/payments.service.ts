import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaymentGateway } from './entities/payment-gateway.entity';
import { Payment, PaymentStatus, PaymentTransactionProvider } from './entities/payment.entity';
import { Payout, PayoutStatus } from './entities/payout.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { InitiatePaymentDto, InitiatePaymentProvider } from './dto/initiate-payment.dto';
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
    private readonly paystackService: PaystackService,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  // ---- Gateway CRUD ----

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

  // ---- Payment Processing ----

  async initiatePayment(
    dto: InitiatePaymentDto,
    userId: string,
  ): Promise<{ paymentId: string; paymentUrl: string; provider: string }> {
    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId },
      relations: ['customer'],
    });
    if (!order) throw new NotFoundException(`Order ${dto.orderId} not found`);
    if (order.customer?.id !== userId) throw new ForbiddenException('Order does not belong to you');
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException(`Order is not in PENDING_PAYMENT status`);
    }

    const currency = this.configService.get<string>('PAYMENT_DEFAULT_CURRENCY') || 'NGN';
    const defaultCallbackUrl =
      this.configService.get<string>('PAYMENT_CALLBACK_URL') || 'http://localhost:3000/payments/callback';
    const callbackUrl = dto.callbackUrl || defaultCallbackUrl;

    const payment = this.paymentRepo.create({
      orderId: order.id,
      order,
      amount: order.totalPrice,
      currency,
      provider: dto.provider as unknown as PaymentTransactionProvider,
      status: PaymentStatus.PENDING,
    });
    const savedPayment = await this.paymentRepo.save(payment);

    let paymentUrl: string;

    if (dto.provider === InitiatePaymentProvider.PAYSTACK) {
      const reference = `PAY-${savedPayment.id}`;
      const result = await this.paystackService.initializeTransaction(
        order.customer?.email || '',
        Number(order.totalPrice),
        currency,
        reference,
        `${callbackUrl}?paymentId=${savedPayment.id}`,
        { orderId: order.id, paymentId: savedPayment.id },
      );
      savedPayment.providerReference = reference;
      await this.paymentRepo.save(savedPayment);
      paymentUrl = result.authorizationUrl;
    } else {
      // Stripe
      const successUrl = `${callbackUrl}?paymentId=${savedPayment.id}&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${callbackUrl}?paymentId=${savedPayment.id}&status=cancelled`;
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
        currency,
        successUrl,
        cancelUrl,
        { orderId: order.id, paymentId: savedPayment.id },
      );
      savedPayment.providerTransactionId = result.sessionId;
      savedPayment.providerReference = result.sessionId;
      await this.paymentRepo.save(savedPayment);
      paymentUrl = result.url;
    }

    return { paymentId: savedPayment.id, paymentUrl, provider: dto.provider };
  }

  async verifyPayment(
    paymentId: string,
    userId: string,
  ): Promise<{ success: boolean; payment: Payment }> {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['order', 'order.customer'],
    });
    if (!payment) throw new NotFoundException(`Payment ${paymentId} not found`);
    if (payment.order?.customer?.id !== userId) {
      throw new ForbiddenException('Payment does not belong to you');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return { success: true, payment };
    }

    let success = false;
    try {
      if (payment.provider === PaymentTransactionProvider.PAYSTACK) {
        const result = await this.paystackService.verifyTransaction(payment.providerReference);
        if (result.status === 'success') {
          payment.status = PaymentStatus.SUCCESS;
          payment.paidAt = new Date(result.paidAt);
          payment.metadata = result as unknown as object;
          success = true;
          await this.updateOrderPaid(payment.orderId);
        } else {
          payment.status = PaymentStatus.FAILED;
        }
      } else {
        const session = await this.stripeService.verifySession(payment.providerReference);
        if (session.payment_status === 'paid') {
          payment.status = PaymentStatus.SUCCESS;
          payment.paidAt = new Date();
          payment.metadata = { sessionId: session.id, paymentStatus: session.payment_status };
          success = true;
          await this.updateOrderPaid(payment.orderId);
        } else {
          payment.status = PaymentStatus.FAILED;
        }
      }
    } catch (err) {
      this.logger.error('Payment verification error', err);
      payment.status = PaymentStatus.FAILED;
    }

    await this.paymentRepo.save(payment);
    return { success, payment };
  }

  async handlePaystackWebhook(body: Buffer, signature: string): Promise<void> {
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY') || '';
    const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
    if (hash !== signature) {
      throw new BadRequestException('Invalid Paystack webhook signature');
    }

    const event = JSON.parse(body.toString());
    const { event: eventType, data } = event;

    if (eventType === 'charge.success') {
      const reference = data.reference as string;
      const payment = await this.paymentRepo.findOne({ where: { providerReference: reference } });
      if (payment && payment.status !== PaymentStatus.SUCCESS) {
        payment.status = PaymentStatus.SUCCESS;
        payment.paidAt = new Date(data.paid_at);
        payment.providerTransactionId = String(data.id);
        payment.metadata = data;
        await this.paymentRepo.save(payment);
        await this.updateOrderPaid(payment.orderId);
      }
    } else if (eventType === 'charge.failed') {
      const reference = data.reference as string;
      const payment = await this.paymentRepo.findOne({ where: { providerReference: reference } });
      if (payment && payment.status === PaymentStatus.PENDING) {
        payment.status = PaymentStatus.FAILED;
        payment.metadata = data;
        await this.paymentRepo.save(payment);
      }
    }
  }

  async handleStripeWebhook(payload: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    let event;
    try {
      event = this.stripeService.constructWebhookEvent(payload, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as {
        id: string;
        metadata?: { paymentId?: string };
        payment_status: string;
      };
      const paymentId = session.metadata?.paymentId;
      if (paymentId) {
        const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
        if (payment && payment.status !== PaymentStatus.SUCCESS) {
          payment.status = PaymentStatus.SUCCESS;
          payment.paidAt = new Date();
          payment.providerTransactionId = session.id;
          payment.metadata = session as unknown as object;
          await this.paymentRepo.save(payment);
          await this.updateOrderPaid(payment.orderId);
        }
      }
    }
  }

  async getPaymentsByOrder(orderId: string): Promise<Payment[]> {
    return this.paymentRepo.find({ where: { orderId }, order: { createdAt: 'DESC' } });
  }

  async initiateSellerPayout(orderId: string): Promise<Payout[]> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['customer'],
    });
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Order must be DELIVERED to initiate payouts');
    }

    const existingPayouts = await this.payoutRepo.find({ where: { orderId } });
    if (existingPayouts.length > 0) {
      throw new BadRequestException('Payouts already exist for this order');
    }

    const payouts: Payout[] = [];
    const currency = this.configService.get<string>('PAYMENT_DEFAULT_CURRENCY') || 'NGN';

    if (Number(order.designerEarnings) > 0) {
      const payout = this.payoutRepo.create({
        orderId,
        order,
        userId: '',
        amount: order.designerEarnings,
        currency,
        status: PayoutStatus.PENDING,
      });
      payouts.push(await this.payoutRepo.save(payout));
    }

    if (Number(order.fabricSellerEarnings) > 0) {
      const payout = this.payoutRepo.create({
        orderId,
        order,
        userId: '',
        amount: order.fabricSellerEarnings,
        currency,
        status: PayoutStatus.PENDING,
      });
      payouts.push(await this.payoutRepo.save(payout));
    }

    return payouts;
  }

  async getPayoutsByUser(userId: string): Promise<Payout[]> {
    return this.payoutRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async getAllPayouts(): Promise<Payout[]> {
    return this.payoutRepo.find({ order: { createdAt: 'DESC' } });
  }

  private async updateOrderPaid(orderId: string): Promise<void> {
    await this.orderRepo.update(orderId, { status: OrderStatus.PAID });
  }
}
