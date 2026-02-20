import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RequestWithUser } from '../auth/auth.types';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DESIGNER, UserRole.ADMIN)
  create(@Request() req: RequestWithUser, @Body() dto: CreateProductDto) {
    return this.productsService.create(req.user.id, dto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DESIGNER, UserRole.ADMIN)
  update(@Param('id') id: string, @Request() req: RequestWithUser, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, req.user.id, req.user.role, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DESIGNER, UserRole.ADMIN)
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.productsService.remove(id, req.user.id, req.user.role);
  }
}
