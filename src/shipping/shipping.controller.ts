import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ShippingService } from './shipping.service';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { AssignTrackingDto } from './dto/assign-tracking.dto';
import { RequestWithUser } from '../auth/auth.types';
import { ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';

@ApiTags('Shipping')
@ApiBearerAuth()
@Controller('shipping')
export class ShippingController {
  constructor(
    private readonly shippingService: ShippingService,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  // --- Legacy carrier endpoints (admin) ---
  @Post('carriers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createCarrier(@Body() dto: CreateCarrierDto) {
    return this.shippingService.create(dto);
  }

  @Get('carriers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllCarriers() {
    return this.shippingService.findAll();
  }

  @Patch('carriers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateCarrier(@Param('id') id: string, @Body() dto: Partial<CreateCarrierDto>) {
    return this.shippingService.update(id, dto);
  }

  // --- Shipping Methods (Admin) ---
  @Post('methods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createMethod(@Body() dto: CreateShippingMethodDto) {
    return this.shippingService.createMethod(dto);
  }

  @Get('methods')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  listMethods() {
    return this.shippingService.findAllMethods();
  }

  @Get('methods/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getMethod(@Param('id') id: string) {
    return this.shippingService.findMethodById(id);
  }

  @Patch('methods/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateMethod(@Param('id') id: string, @Body() dto: UpdateShippingMethodDto) {
    return this.shippingService.updateMethod(id, dto);
  }

  @Delete('methods/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  removeMethod(@Param('id') id: string) {
    return this.shippingService.removeMethod(id);
  }

  // --- Shipments (Admin) ---
  @Post('shipments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createShipment(@Body() dto: CreateShipmentDto) {
    return this.shippingService.createShipment(dto);
  }

  @Get('shipments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  listShipments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.shippingService.listShipments(page ? Number(page) : 1, limit ? Number(limit) : 20);
  }

  @Patch('shipments/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateShipmentStatusDto) {
    return this.shippingService.updateShipmentStatus(id, dto);
  }

  @Patch('shipments/:id/tracking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  assignTracking(@Param('id') id: string, @Body() dto: AssignTrackingDto) {
    return this.shippingService.assignTrackingNumber(id, dto);
  }

  // --- Customer endpoints ---
  @Get('available')
  @UseGuards(JwtAuthGuard)
  getAvailableMethods(
    @Query('country') country?: string,
    @Query('orderTotal') orderTotal?: string,
  ) {
    return this.shippingService.getAvailableMethods(country, orderTotal ? Number(orderTotal) : undefined);
  }

  @Get('orders/:orderId/tracking')
  @UseGuards(JwtAuthGuard)
  async getOrderTracking(@Param('orderId') orderId: string, @Request() req: RequestWithUser) {
    const isAdmin = req.user.role === UserRole.ADMIN;
    if (!isAdmin) {
      const order = await this.orderRepo.findOne({ where: { id: orderId }, relations: ['customer'] });
      if (!order || order.customer?.id !== req.user.id) {
        throw new ForbiddenException('You do not have access to this order');
      }
    }
    return this.shippingService.getShipmentByOrderId(orderId);
  }
}

