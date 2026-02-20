import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PaymentsService } from './payments.service';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { RequestWithUser } from '../auth/auth.types';

@ApiTags('Admin Payments')
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ---- Admin Gateway CRUD ----

  @ApiBearerAuth()
  @Post('admin/payments/gateways')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateGatewayDto) {
    return this.paymentsService.create(dto);
  }

  @ApiBearerAuth()
  @Get('admin/payments/gateways')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.paymentsService.findAll();
  }

  @ApiBearerAuth()
  @Patch('admin/payments/gateways/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<CreateGatewayDto>) {
    return this.paymentsService.update(id, dto);
  }

  // ---- Payment Initiation & Verification ----

  @ApiBearerAuth()
  @Post('payments/initiate')
  @UseGuards(JwtAuthGuard)
  initiatePayment(@Body() dto: InitiatePaymentDto, @Request() req: RequestWithUser) {
    return this.paymentsService.initiatePayment(dto, req.user.id);
  }

  @ApiBearerAuth()
  @Get('payments/verify/:paymentId')
  @UseGuards(JwtAuthGuard)
  verifyPayment(@Param('paymentId') paymentId: string, @Request() req: RequestWithUser) {
    return this.paymentsService.verifyPayment(paymentId, req.user.id);
  }

  @ApiBearerAuth()
  @Get('payments/order/:orderId')
  @UseGuards(JwtAuthGuard)
  getPaymentsByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentsByOrder(orderId);
  }

  // ---- Webhooks (public, no auth) ----

  @Post('payments/webhooks/paystack')
  async paystackWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const body = req.rawBody || Buffer.from('');
    await this.paymentsService.handlePaystackWebhook(body, signature);
    return { received: true };
  }

  @Post('payments/webhooks/stripe')
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const body = req.rawBody || Buffer.from('');
    await this.paymentsService.handleStripeWebhook(body, signature);
    return { received: true };
  }

  // ---- Payouts ----

  @ApiBearerAuth()
  @Post('admin/payments/payouts/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  initiateSellerPayout(@Param('orderId') orderId: string) {
    return this.paymentsService.initiateSellerPayout(orderId);
  }

  @ApiBearerAuth()
  @Get('payments/payouts')
  @UseGuards(JwtAuthGuard)
  getMyPayouts(@Request() req: RequestWithUser) {
    return this.paymentsService.getPayoutsByUser(req.user.id);
  }

  @ApiBearerAuth()
  @Get('admin/payments/payouts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAllPayouts() {
    return this.paymentsService.getAllPayouts();
  }
}
