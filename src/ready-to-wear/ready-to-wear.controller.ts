import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ReadyToWearService } from './ready-to-wear.service';
import { CreateReadyToWearDto } from './dto/create-ready-to-wear.dto';
import { UpdateReadyToWearDto } from './dto/update-ready-to-wear.dto';
import { ReadyToWearFilterDto } from './dto/ready-to-wear-filter.dto';
import { RequestWithUser } from '../auth/auth.types';

@ApiTags('Ready-to-Wear')
@Controller('ready-to-wear')
export class ReadyToWearController {
  constructor(private readonly readyToWearService: ReadyToWearService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DESIGNER, UserRole.ADMIN)
  create(@Request() req: RequestWithUser, @Body() dto: CreateReadyToWearDto) {
    return this.readyToWearService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Query() filters: ReadyToWearFilterDto) {
    return this.readyToWearService.findAll(filters);
  }

  @Get('featured')
  findFeatured() {
    return this.readyToWearService.findFeatured();
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DESIGNER, UserRole.ADMIN)
  getLowStock(@Request() req: RequestWithUser) {
    return this.readyToWearService.getLowStockItems(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.readyToWearService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DESIGNER, UserRole.ADMIN)
  update(@Param('id') id: string, @Request() req: RequestWithUser, @Body() dto: UpdateReadyToWearDto) {
    return this.readyToWearService.update(id, req.user.id, req.user.role, dto);
  }

  @Patch(':id/featured')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  toggleFeatured(@Param('id') id: string) {
    return this.readyToWearService.toggleFeatured(id);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DESIGNER, UserRole.ADMIN)
  updateStock(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body('quantity') quantity: number,
  ) {
    return this.readyToWearService.updateStock(id, req.user.id, req.user.role, quantity);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DESIGNER, UserRole.ADMIN)
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.readyToWearService.remove(id, req.user.id, req.user.role);
  }
}
