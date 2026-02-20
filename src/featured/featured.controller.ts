import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { FeaturedService } from './featured.service';
import { CreateFeaturedSectionDto } from './dto/create-featured-section.dto';

@ApiTags('Homepage Featured')
@Controller('homepage/featured')
export class HomepageFeaturedController {
  constructor(private readonly featuredService: FeaturedService) {}

  @Get()
  getHomepageFeatured() {
    return this.featuredService.getHomepageFeatured();
  }
}

@ApiTags('Admin Featured')
@ApiBearerAuth()
@Controller('admin/featured')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminFeaturedController {
  constructor(private readonly featuredService: FeaturedService) {}

  @Get()
  getSections() {
    return this.featuredService.getSections();
  }

  @Post()
  createSection(@Body() dto: CreateFeaturedSectionDto) {
    return this.featuredService.createSection(dto);
  }

  @Patch(':id')
  updateSection(@Param('id') id: string, @Body() dto: Partial<CreateFeaturedSectionDto>) {
    return this.featuredService.updateSection(id, dto);
  }

  @Delete(':id')
  deleteSection(@Param('id') id: string) {
    return this.featuredService.deleteSection(id);
  }

  @Post('reorder')
  reorderSections(@Body('orderedIds') orderedIds: string[]) {
    return this.featuredService.reorderSections(orderedIds);
  }

  @Get(':id/products')
  getSectionProducts(@Param('id') id: string) {
    return this.featuredService.getSectionProducts(id);
  }
}
