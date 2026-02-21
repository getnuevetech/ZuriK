import { Controller, Post, Delete, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StockAlertsService } from './stock-alerts.service';
import { SubscribeStockAlertDto } from './dto/subscribe-stock-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { StockAlertProductType } from './entities/stock-alert.entity';
import { ConfigService } from '@nestjs/config';

@ApiTags('Stock Alerts')
@ApiBearerAuth()
@Controller()
export class StockAlertsController {
  constructor(
    private readonly stockAlertsService: StockAlertsService,
    private readonly configService: ConfigService,
  ) {}

  @Post('stock-alerts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Subscribe to back-in-stock alert' })
  subscribe(@Req() req: any, @Body() dto: SubscribeStockAlertDto) {
    return this.stockAlertsService.subscribe(req.user.id, dto.productId, dto.productType);
  }

  @Delete('stock-alerts/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Unsubscribe from back-in-stock alert' })
  unsubscribe(@Req() req: any, @Param('productId') productId: string) {
    return this.stockAlertsService.unsubscribe(req.user.id, productId);
  }

  @Get('stock-alerts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my stock alerts' })
  getMyAlerts(@Req() req: any) {
    return this.stockAlertsService.getMyAlerts(req.user.id);
  }

  @Post('admin/stock-alerts/:productId/notify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: manually trigger back-in-stock notifications' })
  async triggerNotify(
    @Param('productId') productId: string,
    @Body() body: { productType: StockAlertProductType; productName: string },
  ) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    await this.stockAlertsService.notifyBackInStock(productId, body.productType, body.productName, frontendUrl);
    return { message: 'Notifications sent' };
  }
}
