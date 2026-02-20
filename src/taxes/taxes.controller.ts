import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { TaxesService } from './taxes.service';
import { CreateTaxDto } from './dto/create-tax.dto';

@ApiTags('Admin Taxes')
@ApiBearerAuth()
@Controller('admin/taxes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Post()
  create(@Body() dto: CreateTaxDto) {
    return this.taxesService.create(dto);
  }

  @Get()
  findAll() {
    return this.taxesService.findAll();
  }

  @Get('preview')
  preview(@Query('subtotal') subtotal: string, @Query('country') country: string) {
    return this.taxesService.previewTax(Number(subtotal), country);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateTaxDto>) {
    return this.taxesService.update(id, dto);
  }
}
