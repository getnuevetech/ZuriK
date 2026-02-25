import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './dto/create-settings.dto';

@ApiTags('Settings')
@Controller('settings')
export class PublicSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('platform-fee-rate')
  async getPlatformFeeRate() {
    const settings = await this.settingsService.findActive();
    return { percentageFee: settings ? Number(settings.percentageFee) : 10 };
  }

  @Get('currency')
  async getCurrency() {
    const settings = await this.settingsService.findActive();
    return { currency: settings?.currency ?? 'USD' };
  }
}

@ApiTags('Admin Settings')
@ApiBearerAuth()
@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  create(@Body() dto: CreateSettingsDto) {
    return this.settingsService.create(dto);
  }

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get('preview-fee')
  previewFee(@Query('designPrice') designPrice: string, @Query('fabricPrice') fabricPrice: string) {
    return this.settingsService.previewFee(Number(designPrice), Number(fabricPrice));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateSettingsDto>) {
    return this.settingsService.update(id, dto);
  }
}
