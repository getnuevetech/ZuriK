import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Design } from './entities/design.entity';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';
import { UserRole } from '../users/entities/user.entity';
import { DesignFilterDto, DesignSortOption } from './dto/design-filter.dto';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class DesignsService {
  constructor(
    @InjectRepository(Design)
    private readonly designRepo: Repository<Design>,
  ) {}

  async create(designerId: string, dto: CreateDesignDto): Promise<Design> {
    const design = this.designRepo.create({
      ...dto,
      designer: { id: designerId },
    });
    return this.designRepo.save(design);
  }

  async findAll(filters: DesignFilterDto = {}): Promise<PaginatedResponse<Design>> {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      tags,
      designerId,
      sort = DesignSortOption.NEWEST,
      page = 1,
      limit = 20,
    } = filters;

    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const qb = this.designRepo
      .createQueryBuilder('design')
      .leftJoinAndSelect('design.designer', 'designer')
      .where('design.isActive = :isActive', { isActive: true });

    if (search && search.trim()) {
      qb.andWhere(
        '(design.name ILIKE :search OR design.description ILIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }
    if (category) {
      qb.andWhere('design.category = :category', { category });
    }
    if (minPrice !== undefined) {
      qb.andWhere('design.customerPrice >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('design.customerPrice <= :maxPrice', { maxPrice });
    }
    if (minRating !== undefined) {
      qb.andWhere('design.averageRating >= :minRating', { minRating });
    }
    if (designerId) {
      qb.andWhere('designer.id = :designerId', { designerId });
    }
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        qb.andWhere(
          tagList.map((_, i) => `design.tags ILIKE :tag${i}`).join(' OR '),
          Object.fromEntries(tagList.map((t, i) => [`tag${i}`, `%${t}%`])),
        );
      }
    }

    switch (sort) {
      case DesignSortOption.PRICE_ASC:
        qb.orderBy('design.customerPrice', 'ASC');
        break;
      case DesignSortOption.PRICE_DESC:
        qb.orderBy('design.customerPrice', 'DESC');
        break;
      case DesignSortOption.NAME_ASC:
        qb.orderBy('design.name', 'ASC');
        break;
      case DesignSortOption.NAME_DESC:
        qb.orderBy('design.name', 'DESC');
        break;
      case DesignSortOption.OLDEST:
        qb.orderBy('design.createdAt', 'ASC');
        break;
      case DesignSortOption.RATING_DESC:
        qb.orderBy('design.averageRating', 'DESC');
        break;
      case DesignSortOption.POPULAR:
        qb.orderBy('design.totalReviews', 'DESC');
        break;
      default:
        qb.orderBy('design.createdAt', 'DESC');
    }

    const [items, total] = await qb.skip(skip).take(take).getManyAndCount();

    return { items, total, page, limit: take, totalPages: Math.ceil(total / take) };
  }

  async findFeatured(): Promise<Design[]> {
    return this.designRepo.find({
      where: { isFeatured: true, isActive: true },
      relations: ['designer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Design> {
    const design = await this.designRepo.findOne({
      where: { id },
      relations: ['designer'],
    });
    if (!design) throw new NotFoundException(`Design ${id} not found`);
    return design;
  }

  async update(id: string, designerId: string, role: UserRole, dto: UpdateDesignDto): Promise<Design> {
    const design = await this.designRepo.findOne({ where: { id }, relations: ['designer'] });
    if (!design) throw new NotFoundException(`Design ${id} not found`);
    if (role !== UserRole.ADMIN && design.designer?.id !== designerId) {
      throw new ForbiddenException('You can only update your own designs');
    }
    Object.assign(design, dto);
    return this.designRepo.save(design);
  }

  async toggleFeatured(id: string): Promise<Design> {
    const design = await this.designRepo.findOne({ where: { id } });
    if (!design) throw new NotFoundException(`Design ${id} not found`);
    design.isFeatured = !design.isFeatured;
    return this.designRepo.save(design);
  }

  async remove(id: string, designerId: string, role: UserRole): Promise<void> {
    const design = await this.designRepo.findOne({ where: { id }, relations: ['designer'] });
    if (!design) throw new NotFoundException(`Design ${id} not found`);
    if (role !== UserRole.ADMIN && design.designer?.id !== designerId) {
      throw new ForbiddenException('You can only deactivate your own designs');
    }
    design.isActive = false;
    await this.designRepo.save(design);
  }
}
