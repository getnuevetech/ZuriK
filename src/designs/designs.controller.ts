import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { DesignsService } from './designs.service';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';
import { DesignFilterDto } from './dto/design-filter.dto';
import { RequestWithUser } from '../auth/auth.types';

@ApiTags('Designs')
@Controller('designs')
export class DesignsController {
  constructor(private readonly designsService: DesignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DESIGNER, UserRole.ADMIN)
  create(@Request() req: RequestWithUser, @Body() dto: CreateDesignDto) {
    return this.designsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Query() filters: DesignFilterDto) {
    return this.designsService.findAll(filters);
  }

  @Get('featured')
  findFeatured() {
    return this.designsService.findFeatured();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.designsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DESIGNER, UserRole.ADMIN)
  update(@Param('id') id: string, @Request() req: RequestWithUser, @Body() dto: UpdateDesignDto) {
    return this.designsService.update(id, req.user.id, req.user.role, dto);
  }

  @Patch(':id/featured')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  toggleFeatured(@Param('id') id: string) {
    return this.designsService.toggleFeatured(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DESIGNER, UserRole.ADMIN)
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.designsService.remove(id, req.user.id, req.user.role);
  }
}
