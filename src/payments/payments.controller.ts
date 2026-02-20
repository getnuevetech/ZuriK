import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PaymentsService } from './payments.service';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';

// ── Admin gateway management ─────────────────────────────────────────────────

@ApiTags('Admin Payments')
@ApiBearerAuth()
@Controller('admin/payments/gateways')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() dto: CreateGatewayDto) {
    return this.paymentsService.create(dto);
  }

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateGatewayDto>) {
    return this.paymentsService.update(id, dto);
  }
}

// ── Customer payment endpoints ───────────────────────────────────────────────

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class CustomerPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  initiatePayment(@Body() dto: InitiatePaymentDto, @Req() req: Request & { user: { id: string } }) {
    return this.paymentsService.initiatePayment(
      dto.orderId,
      req.user.id,
      dto.provider,
      dto.callbackUrl,
    );
  }

  @Get('verify/:paymentId')
  @UseGuards(JwtAuthGuard)
  verifyPayment(
    @Param('paymentId') paymentId: string,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.paymentsService.verifyPayment(paymentId, req.user.id);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  getByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentsByOrder(orderId);
  }

  @Get('payouts')
  @UseGuards(JwtAuthGuard)
  getMyPayouts(@Req() req: Request & { user: { id: string } }) {
    return this.paymentsService.getPayoutsForUser(req.user.id);
  }

  @Post('webhooks/paystack')
  async paystackWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature: string,
  ) {
    await this.paymentsService.handlePaystackWebhook(req.rawBody ?? Buffer.alloc(0), signature);
    return { received: true };
  }

  @Post('webhooks/stripe')
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.paymentsService.handleStripeWebhook(req.rawBody ?? Buffer.alloc(0), signature);
    return { received: true };
  }
}

// ── Admin payout endpoints ───────────────────────────────────────────────────

@ApiTags('Admin Payments')
@ApiBearerAuth()
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPayoutsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payouts/:orderId')
  initiateSellerPayout(@Param('orderId') orderId: string) {
    return this.paymentsService.initiateSellerPayout(orderId);
  }

  @Get('payouts')
  getAllPayouts() {
    return this.paymentsService.getAllPayouts();
  }
}
