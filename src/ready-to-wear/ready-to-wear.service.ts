import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReadyToWearProduct } from './entities/ready-to-wear-product.entity';
import { CreateReadyToWearDto } from './dto/create-ready-to-wear.dto';
import { UpdateReadyToWearDto } from './dto/update-ready-to-wear.dto';
import { UserRole } from '../users/entities/user.entity';
import { ReadyToWearFilterDto, ReadyToWearSortOption } from './dto/ready-to-wear-filter.dto';
import { PaginatedResponse } from '../designs/designs.service';

@Injectable()
export class ReadyToWearService {
  constructor(
    @InjectRepository(ReadyToWearProduct)
    private readonly rtwRepo: Repository<ReadyToWearProduct>,
  ) {}

  async create(designerId: string, dto: CreateReadyToWearDto): Promise<ReadyToWearProduct> {
    const product = this.rtwRepo.create({
      ...dto,
      designer: { id: designerId },
    });
    return this.rtwRepo.save(product);
  }

  async findAll(filters: ReadyToWearFilterDto = {}): Promise<PaginatedResponse<ReadyToWearProduct>> {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      tags,
      designerId,
      includeInactive,
      sort = ReadyToWearSortOption.NEWEST,
      page = 1,
      limit = 20,
    } = filters;

    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const qb = this.rtwRepo
      .createQueryBuilder('rtw')
      .leftJoinAndSelect('rtw.designer', 'designer');

    if (!includeInactive) {
      qb.where('rtw.isActive = :isActive', { isActive: true });
    } else {
      qb.where('1=1');
    }

    if (search && search.trim()) {
      qb.andWhere(
        '(rtw.name ILIKE :search OR rtw.description ILIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }
    if (category) {
      qb.andWhere('rtw.category = :category', { category });
    }
    if (minPrice !== undefined) {
      qb.andWhere('rtw.customerPrice >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('rtw.customerPrice <= :maxPrice', { maxPrice });
    }
    if (minRating !== undefined) {
      qb.andWhere('rtw.averageRating >= :minRating', { minRating });
    }
    if (designerId) {
      qb.andWhere('designer.id = :designerId', { designerId });
    }
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        qb.andWhere(
          tagList.map((_, i) => `rtw.tags ILIKE :tag${i}`).join(' OR '),
          Object.fromEntries(tagList.map((t, i) => [`tag${i}`, `%${t}%`])),
        );
      }
    }

    switch (sort) {
      case ReadyToWearSortOption.PRICE_ASC:
        qb.orderBy('rtw.customerPrice', 'ASC');
        break;
      case ReadyToWearSortOption.PRICE_DESC:
        qb.orderBy('rtw.customerPrice', 'DESC');
        break;
      case ReadyToWearSortOption.NAME_ASC:
        qb.orderBy('rtw.name', 'ASC');
        break;
      case ReadyToWearSortOption.NAME_DESC:
        qb.orderBy('rtw.name', 'DESC');
        break;
      case ReadyToWearSortOption.OLDEST:
        qb.orderBy('rtw.createdAt', 'ASC');
        break;
      case ReadyToWearSortOption.RATING_DESC:
        qb.orderBy('rtw.averageRating', 'DESC');
        break;
      case ReadyToWearSortOption.POPULAR:
        qb.orderBy('rtw.totalReviews', 'DESC');
        break;
      default:
        qb.orderBy('rtw.createdAt', 'DESC');
    }

    const [items, total] = await qb.skip(skip).take(take).getManyAndCount();
    return { items, total, page, limit: take, totalPages: Math.ceil(total / take) };
  }

  async findFeatured(): Promise<ReadyToWearProduct[]> {
    return this.rtwRepo.find({
      where: { isFeatured: true, isActive: true },
      relations: ['designer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ReadyToWearProduct> {
    const product = await this.rtwRepo.findOne({ where: { id }, relations: ['designer'] });
    if (!product) throw new NotFoundException(`Ready-to-wear product ${id} not found`);
    return product;
  }

  async update(id: string, designerId: string, role: UserRole, dto: UpdateReadyToWearDto): Promise<ReadyToWearProduct> {
    const product = await this.rtwRepo.findOne({ where: { id }, relations: ['designer'] });
    if (!product) throw new NotFoundException(`Ready-to-wear product ${id} not found`);
    if (role !== UserRole.ADMIN && product.designer?.id !== designerId) {
      throw new ForbiddenException('You can only update your own products');
    }
    Object.assign(product, dto);
    return this.rtwRepo.save(product);
  }

  async toggleFeatured(id: string): Promise<ReadyToWearProduct> {
    const product = await this.rtwRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Ready-to-wear product ${id} not found`);
    product.isFeatured = !product.isFeatured;
    return this.rtwRepo.save(product);
  }

  async remove(id: string, designerId: string, role: UserRole): Promise<void> {
    const product = await this.rtwRepo.findOne({ where: { id }, relations: ['designer'] });
    if (!product) throw new NotFoundException(`Ready-to-wear product ${id} not found`);
    if (role !== UserRole.ADMIN && product.designer?.id !== designerId) {
      throw new ForbiddenException('You can only deactivate your own products');
    }
    product.isActive = false;
    await this.rtwRepo.save(product);
  }

  async updateStock(id: string, designerId: string, role: UserRole, quantity: number): Promise<ReadyToWearProduct> {
    const product = await this.rtwRepo.findOne({ where: { id }, relations: ['designer'] });
    if (!product) throw new NotFoundException(`Ready-to-wear product ${id} not found`);
    if (role !== UserRole.ADMIN && product.designer?.id !== designerId) {
      throw new ForbiddenException('You can only update stock for your own products');
    }
    product.stock = quantity;
    return this.rtwRepo.save(product);
  }

  async getLowStockItems(designerId: string): Promise<ReadyToWearProduct[]> {
    return this.rtwRepo
      .createQueryBuilder('rtw')
      .leftJoinAndSelect('rtw.designer', 'designer')
      .where('designer.id = :designerId', { designerId })
      .andWhere('rtw.isActive = true')
      .andWhere('rtw.trackInventory = true')
      .andWhere('rtw.stock <= rtw.lowStockThreshold')
      .getMany();
  }
}
