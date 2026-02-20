import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { FabricsService } from './fabrics.service';
import { CreateFabricDto } from './dto/create-fabric.dto';
import { UpdateFabricDto } from './dto/update-fabric.dto';
import { RequestWithUser } from '../auth/auth.types';

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
  findAll() {
    return this.fabricsService.findAll();
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
}
