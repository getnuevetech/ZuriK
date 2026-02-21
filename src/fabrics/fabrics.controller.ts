import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { FabricsService } from './fabrics.service';
import { CreateFabricDto } from './dto/create-fabric.dto';
import { UpdateFabricDto } from './dto/update-fabric.dto';
import { FabricFilterDto } from './dto/fabric-filter.dto';
import { RequestWithUser } from '../auth/auth.types';

@ApiTags('Fabrics')
@Controller('fabrics')
export class FabricsController {
  constructor(private readonly fabricsService: FabricsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FABRIC_SELLER, UserRole.ADMIN)
  create(@Request() req: RequestWithUser, @Body() dto: CreateFabricDto) {
    return this.fabricsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Query() filters: FabricFilterDto) {
    return this.fabricsService.findAll(filters);
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FABRIC_SELLER, UserRole.ADMIN)
  getLowStock(@Request() req: RequestWithUser) {
    return this.fabricsService.getLowStockItems(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fabricsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FABRIC_SELLER, UserRole.ADMIN)
  update(@Param('id') id: string, @Request() req: RequestWithUser, @Body() dto: UpdateFabricDto) {
    return this.fabricsService.update(id, req.user.id, req.user.role, dto);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FABRIC_SELLER, UserRole.ADMIN)
  updateStock(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body('quantity') quantity: number,
  ) {
    return this.fabricsService.updateStock(id, req.user.id, req.user.role, quantity);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FABRIC_SELLER, UserRole.ADMIN)
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.fabricsService.remove(id, req.user.id, req.user.role);
  }
}
