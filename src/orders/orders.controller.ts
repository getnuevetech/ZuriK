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
import { UserRole } from '../user/user.entity';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CalculateOrderDto } from './dto/calculate-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RequestWithUser } from '../auth/auth.types';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('calculate')
  calculate(@Body() dto: CalculateOrderDto) {
    return this.ordersService.calculateOrder(dto);
  }

  @Post()
  create(@Request() req: RequestWithUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.id, dto);
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
  updateStatus(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, req.user.id, req.user.role, dto);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.QA, UserRole.ADMIN)
@Controller('qa')
export class QaController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('orders/:id/approve')
  approveOrder(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.ordersService.approveOrder(id, req.user.id);
  }

  @Post('orders/:id/reject')
  rejectOrder(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() body: { reason: string },
  ) {
    return this.ordersService.rejectOrder(id, req.user.id, body.reason);
  }
}
