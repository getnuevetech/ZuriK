import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ShippingService } from './shipping.service';
import { CreateCarrierDto } from './dto/create-carrier.dto';

@ApiTags('Admin Shipping')
@ApiBearerAuth()
@Controller('admin/shipping/carriers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post()
  create(@Body() dto: CreateCarrierDto) {
    return this.shippingService.create(dto);
  }

  @Get()
  findAll() {
    return this.shippingService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCarrierDto>) {
    return this.shippingService.update(id, dto);
  }
}
