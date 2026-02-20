import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { HeroBannersService } from './hero-banners.service';
import { CreateHeroBannerDto } from './dto/create-hero-banner.dto';
import { UpdateHeroBannerDto } from './dto/update-hero-banner.dto';

@ApiTags('hero-banners')
@Controller('hero-banners')
export class HeroBannersController {
  constructor(private readonly heroBannersService: HeroBannersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active hero banners (public)' })
  findAllActive() {
    return this.heroBannersService.findAllActive();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a hero banner (admin only)' })
  create(@Body() dto: CreateHeroBannerDto) {
    return this.heroBannersService.create(dto);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk reorder hero banners (admin only)' })
  reorder(@Body() orders: { id: string; sortOrder: number }[]) {
    return this.heroBannersService.reorder(orders);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a hero banner (admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateHeroBannerDto) {
    return this.heroBannersService.update(id, dto);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle hero banner active status (admin only)' })
  toggle(@Param('id') id: string) {
    return this.heroBannersService.toggle(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a hero banner (admin only)' })
  remove(@Param('id') id: string) {
    return this.heroBannersService.remove(id);
  }
}
