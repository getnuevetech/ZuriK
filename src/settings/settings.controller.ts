import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './dto/create-settings.dto';

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
