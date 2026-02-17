import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DesignsService } from './designs.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../../database/entities/user.entity';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';
import { DesignCategory } from '../../database/entities/design.entity';

@ApiTags('Designs')
@Controller('designs')
export class DesignsController {
  constructor(private readonly designsService: DesignsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all designs with filters' })
  @ApiQuery({ name: 'category', enum: DesignCategory, required: false })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'designerId', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiResponse({ status: 200, description: 'Designs retrieved' })
  async findAll(@Query() filters: any) {
    const designs = await this.designsService.findAll(filters);
    return { designs, count: designs.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get design by ID' })
  @ApiResponse({ status: 200, description: 'Design found' })
  @ApiResponse({ status: 404, description: 'Design not found' })
  async findOne(@Param('id') id: string) {
    const design = await this.designsService.findOne(id);
    return { design };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DESIGNER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new design (Designer only)' })
  @ApiResponse({ status: 201, description: 'Design created' })
  @ApiResponse({ status: 403, description: 'Forbidden - Designer role required' })
  async create(@Body() createDesignDto: CreateDesignDto, @CurrentUser() user: User) {
    const design = await this.designsService.create(createDesignDto, user);
    return {
      message: 'Design created successfully',
      design,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DESIGNER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update design' })
  @ApiResponse({ status: 200, description: 'Design updated' })
  @ApiResponse({ status: 404, description: 'Design not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDesignDto: UpdateDesignDto,
    @CurrentUser() user: User,
  ) {
    const design = await this.designsService.update(id, updateDesignDto, user);
    return {
      message: 'Design updated successfully',
      design,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DESIGNER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete design' })
  @ApiResponse({ status: 200, description: 'Design deleted' })
  @ApiResponse({ status: 404, description: 'Design not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.designsService.remove(id, user);
    return { message: 'Design deleted successfully' };
  }
}
