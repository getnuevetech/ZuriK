import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { OrdersService } from './orders.service';
import { CreateCustomDesignOrderDto } from './dto/create-custom-design-order.dto';
import { CreateReadyToWearOrderDto } from './dto/create-ready-to-wear-order.dto';
import { CreateFabricOnlyOrderDto } from './dto/create-fabric-only-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateSubOrderStatusDto, UpdateDesignerSubOrderStatusDto } from './dto/update-sub-order-status.dto';
import { UpdateSubOrderTrackingDto } from './dto/update-sub-order-tracking.dto';
import { RequestWithUser } from '../auth/auth.types';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('custom-design')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  createCustomDesign(@Request() req: RequestWithUser, @Body() dto: CreateCustomDesignOrderDto) {
    return this.ordersService.createCustomDesignOrder(req.user.id, dto);
  }

  @Post('ready-to-wear')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  createReadyToWear(@Request() req: RequestWithUser, @Body() dto: CreateReadyToWearOrderDto) {
    return this.ordersService.createReadyToWearOrder(req.user.id, dto);
  }

  @Post('fabric-only')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CUSTOMER)
  createFabricOnly(@Request() req: RequestWithUser, @Body() dto: CreateFabricOnlyOrderDto) {
    return this.ordersService.createFabricOnlyOrder(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: RequestWithUser) {
    return this.ordersService.getOrdersForUser(req.user.id, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.ordersService.getOrderById(id, req.user.id, req.user.role);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DESIGNER, UserRole.QA, UserRole.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, req.user.id, req.user.role, dto);
  }

  @Patch('designer/:id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DESIGNER)
  updateDesignerSubOrderStatus(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() dto: UpdateDesignerSubOrderStatusDto,
  ) {
    return this.ordersService.updateDesignerSubOrderStatus(id, req.user.id, dto);
  }

  @Patch('designer/:id/tracking')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DESIGNER)
  updateDesignerSubOrderTracking(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() dto: UpdateSubOrderTrackingDto,
  ) {
    return this.ordersService.updateDesignerSubOrderTracking(id, req.user.id, dto);
  }

  @Patch('fabric-seller/:id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FABRIC_SELLER)
  updateFabricSellerSubOrderStatus(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() dto: UpdateSubOrderStatusDto,
  ) {
    return this.ordersService.updateFabricSellerSubOrderStatus(id, req.user.id, dto);
  }

  @Patch('fabric-seller/:id/tracking')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FABRIC_SELLER)
  updateFabricSellerSubOrderTracking(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() dto: UpdateSubOrderTrackingDto,
  ) {
    return this.ordersService.updateFabricSellerSubOrderTracking(id, req.user.id, dto);
  }
}
