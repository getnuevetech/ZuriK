import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FabricsService } from './fabrics.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../../database/entities/user.entity';
import { CreateFabricDto } from './dto/create-fabric.dto';
import { UpdateFabricDto } from './dto/update-fabric.dto';
import { FabricType } from '../../database/entities/fabric.entity';

@ApiTags('Fabrics')
@Controller('fabrics')
export class FabricsController {
  constructor(private readonly fabricsService: FabricsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all fabrics with filters' })
  @ApiQuery({ name: 'fabricType', enum: FabricType, required: false })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'sellerId', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiResponse({ status: 200, description: 'Fabrics retrieved' })
  async findAll(@Query() filters: any) {
    const fabrics = await this.fabricsService.findAll(filters);
    return { fabrics, count: fabrics.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fabric by ID' })
  @ApiResponse({ status: 200, description: 'Fabric found' })
  @ApiResponse({ status: 404, description: 'Fabric not found' })
  async findOne(@Param('id') id: string) {
    const fabric = await this.fabricsService.findOne(id);
    return { fabric };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FABRIC_SELLER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new fabric listing (Fabric Seller only)' })
  @ApiResponse({ status: 201, description: 'Fabric created' })
  @ApiResponse({ status: 403, description: 'Forbidden - Fabric Seller role required' })
  async create(@Body() createFabricDto: CreateFabricDto, @CurrentUser() user: User) {
    const fabric = await this.fabricsService.create(createFabricDto, user);
    return {
      message: 'Fabric created successfully',
      fabric,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FABRIC_SELLER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update fabric listing' })
  @ApiResponse({ status: 200, description: 'Fabric updated' })
  @ApiResponse({ status: 404, description: 'Fabric not found' })
  async update(
    @Param('id') id: string,
    @Body() updateFabricDto: UpdateFabricDto,
    @CurrentUser() user: User,
  ) {
    const fabric = await this.fabricsService.update(id, updateFabricDto, user);
    return {
      message: 'Fabric updated successfully',
      fabric,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FABRIC_SELLER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete fabric listing' })
  @ApiResponse({ status: 200, description: 'Fabric deleted' })
  @ApiResponse({ status: 404, description: 'Fabric not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.fabricsService.remove(id, user);
    return { message: 'Fabric deleted successfully' };
  }
}
