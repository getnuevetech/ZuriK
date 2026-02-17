import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MeasurementsService } from './measurements.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';

@ApiTags('Measurements')
@Controller('measurements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user measurements' })
  @ApiResponse({ status: 200, description: 'Measurements retrieved' })
  async findAll(@CurrentUser() user: User) {
    const measurements = await this.measurementsService.findUserMeasurements(user.id);
    return { measurements, count: measurements.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get measurement by ID' })
  @ApiResponse({ status: 200, description: 'Measurement found' })
  @ApiResponse({ status: 404, description: 'Measurement not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const measurement = await this.measurementsService.findOne(id, user);
    return { measurement };
  }

  @Post()
  @ApiOperation({ summary: 'Create new measurement' })
  @ApiResponse({ status: 201, description: 'Measurement created' })
  async create(@Body() createMeasurementDto: CreateMeasurementDto, @CurrentUser() user: User) {
    const measurement = await this.measurementsService.create(createMeasurementDto, user);
    return {
      message: 'Measurement created successfully',
      measurement,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update measurement' })
  @ApiResponse({ status: 200, description: 'Measurement updated' })
  @ApiResponse({ status: 404, description: 'Measurement not found' })
  async update(
    @Param('id') id: string,
    @Body() updateMeasurementDto: UpdateMeasurementDto,
    @CurrentUser() user: User,
  ) {
    const measurement = await this.measurementsService.update(id, updateMeasurementDto, user);
    return {
      message: 'Measurement updated successfully',
      measurement,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete measurement' })
  @ApiResponse({ status: 200, description: 'Measurement deleted' })
  @ApiResponse({ status: 404, description: 'Measurement not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.measurementsService.remove(id, user);
    return { message: 'Measurement deleted successfully' };
  }
}
