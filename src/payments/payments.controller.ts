import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PaymentsService } from './payments.service';
import { CreateGatewayDto } from './dto/create-gateway.dto';

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
