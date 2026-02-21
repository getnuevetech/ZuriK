import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AbandonedCartService } from './abandoned-cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Admin - Abandoned Carts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/abandoned-carts')
export class AbandonedCartController {
  constructor(private readonly abandonedCartService: AbandonedCartService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated abandoned carts' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.abandonedCartService.findAll(Number(page), Number(limit));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get abandoned cart recovery stats' })
  async getStats() {
    return this.abandonedCartService.getStats();
  }
}
