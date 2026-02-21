import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UserRole } from '../users/entities/user.entity';
import { ProductFilterDto, ProductSortOption } from './dto/product-filter.dto';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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
    });
    return this.productRepo.save(product);
  }

  async findAll(filters: ProductFilterDto = {}): Promise<PaginatedResponse<Product>> {
    const {
      search,
      category,
      country,
      minPrice,
      maxPrice,
      minRating,
      tags,
      designerId,
      sort = ProductSortOption.NEWEST,
      page = 1,
      limit = 20,
    } = filters;

    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.designer', 'designer')
      .where('product.isActive = :isActive', { isActive: true });

    if (search && search.trim()) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }
    if (category) {
      qb.andWhere('product.category = :category', { category });
    }
    if (country) {
      qb.andWhere('product.country = :country', { country });
    }
    if (minPrice !== undefined) {
      qb.andWhere('product.customerPrice >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('product.customerPrice <= :maxPrice', { maxPrice });
    }
    if (minRating !== undefined) {
      qb.andWhere('product.averageRating >= :minRating', { minRating });
    }
    if (designerId) {
      qb.andWhere('designer.id = :designerId', { designerId });
    }
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        qb.andWhere(
          tagList.map((_, i) => `product.tags ILIKE :tag${i}`).join(' OR '),
          Object.fromEntries(tagList.map((t, i) => [`tag${i}`, `%${t}%`])),
        );
      }
    }

    switch (sort) {
      case ProductSortOption.PRICE_ASC:
        qb.orderBy('product.customerPrice', 'ASC');
        break;
      case ProductSortOption.PRICE_DESC:
        qb.orderBy('product.customerPrice', 'DESC');
        break;
      case ProductSortOption.NAME_ASC:
        qb.orderBy('product.name', 'ASC');
        break;
      case ProductSortOption.NAME_DESC:
        qb.orderBy('product.name', 'DESC');
        break;
      case ProductSortOption.OLDEST:
        qb.orderBy('product.createdAt', 'ASC');
        break;
      case ProductSortOption.RATING_DESC:
        qb.orderBy('product.averageRating', 'DESC');
        break;
      case ProductSortOption.POPULAR:
        qb.orderBy('product.totalReviews', 'DESC');
        break;
      default:
        qb.orderBy('product.createdAt', 'DESC');
    }

    const [items, total] = await qb.skip(skip).take(take).getManyAndCount();

    return {
      items,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
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
    await this.productRepo.save(product);
  }
}
