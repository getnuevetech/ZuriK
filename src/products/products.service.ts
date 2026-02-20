import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(designerId: string, dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create({
      ...dto,
      designer: { id: designerId },
      price: dto.customerPrice,
    });
    return this.productRepo.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepo.find({
      where: { isActive: true },
      relations: ['designer'],
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['designer'],
    });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  async update(id: string, designerId: string, role: UserRole, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['designer'],
    });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    if (role !== UserRole.ADMIN && product.designer?.id !== designerId) {
      throw new ForbiddenException('You can only update your own products');
    }
    Object.assign(product, dto);
    if (dto.customerPrice) product.price = dto.customerPrice;
    return this.productRepo.save(product);
  }

  async remove(id: string, designerId: string, role: UserRole): Promise<void> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['designer'],
    });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    if (role !== UserRole.ADMIN && product.designer?.id !== designerId) {
      throw new ForbiddenException('You can only deactivate your own products');
    }
    product.isActive = false;
    product.active = false;
    await this.productRepo.save(product);
  }
}
