import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fabric } from './entities/fabric.entity';
import { CreateFabricDto } from './dto/create-fabric.dto';
import { UpdateFabricDto } from './dto/update-fabric.dto';
import { UserRole } from '../users/entities/user.entity';
import { FabricFilterDto, FabricSortOption } from './dto/fabric-filter.dto';
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class FabricsService {
  constructor(
    @InjectRepository(Fabric)
    private readonly fabricRepo: Repository<Fabric>,
  ) {}

  async create(sellerId: string, dto: CreateFabricDto): Promise<Fabric> {
    const fabric = this.fabricRepo.create({
      ...dto,
      seller: { id: sellerId },
    });
    return this.fabricRepo.save(fabric);
  }

  async findAll(filters: FabricFilterDto = {}): Promise<PaginatedResponse<Fabric>> {
    const {
      search,
      material,
      pattern,
      minPrice,
      maxPrice,
      inStock,
      includeInactive,
      sort = FabricSortOption.NEWEST,
      page = 1,
      limit = 20,
    } = filters;

    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const qb = this.fabricRepo
      .createQueryBuilder('fabric')
      .leftJoinAndSelect('fabric.seller', 'seller');

    if (!includeInactive) {
      qb.where('fabric.isActive = :isActive', { isActive: true });
    }

    if (search) {
      qb.andWhere(
        '(fabric.name ILIKE :search OR fabric.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (material) {
      qb.andWhere('fabric.material = :material', { material });
    }
    if (pattern) {
      qb.andWhere('fabric.patterns ILIKE :pattern', { pattern: `%${pattern}%` });
    }
    if (minPrice !== undefined) {
      qb.andWhere('fabric.customerPrice >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('fabric.customerPrice <= :maxPrice', { maxPrice });
    }
    if (inStock !== undefined) {
      qb.andWhere(inStock ? 'fabric.stock > 0' : 'fabric.stock = 0');
    }

    switch (sort) {
      case FabricSortOption.PRICE_ASC:
        qb.orderBy('fabric.customerPrice', 'ASC');
        break;
      case FabricSortOption.PRICE_DESC:
        qb.orderBy('fabric.customerPrice', 'DESC');
        break;
      case FabricSortOption.NAME_ASC:
        qb.orderBy('fabric.name', 'ASC');
        break;
      case FabricSortOption.NAME_DESC:
        qb.orderBy('fabric.name', 'DESC');
        break;
      case FabricSortOption.OLDEST:
        qb.orderBy('fabric.createdAt', 'ASC');
        break;
      default:
        qb.orderBy('fabric.createdAt', 'DESC');
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

  async findOne(id: string): Promise<Fabric> {
    const fabric = await this.fabricRepo.findOne({
      where: { id },
      relations: ['seller'],
    });
    if (!fabric) {
      throw new NotFoundException(`Fabric ${id} not found`);
    }
    return fabric;
  }

  async update(id: string, sellerId: string, role: UserRole, dto: UpdateFabricDto): Promise<Fabric> {
    const fabric = await this.fabricRepo.findOne({
      where: { id },
      relations: ['seller'],
    });
    if (!fabric) {
      throw new NotFoundException(`Fabric ${id} not found`);
    }
    if (role !== UserRole.ADMIN && fabric.seller?.id !== sellerId) {
      throw new ForbiddenException('You can only update your own fabrics');
    }
    Object.assign(fabric, dto);
    return this.fabricRepo.save(fabric);
  }

  async remove(id: string, sellerId: string, role: UserRole): Promise<void> {
    const fabric = await this.fabricRepo.findOne({
      where: { id },
      relations: ['seller'],
    });
    if (!fabric) {
      throw new NotFoundException(`Fabric ${id} not found`);
    }
    if (role !== UserRole.ADMIN && fabric.seller?.id !== sellerId) {
      throw new ForbiddenException('You can only deactivate your own fabrics');
    }
    fabric.isActive = false;
    await this.fabricRepo.save(fabric);
  }

  async updateStock(id: string, sellerId: string, role: UserRole, quantity: number): Promise<Fabric> {
    const fabric = await this.fabricRepo.findOne({ where: { id }, relations: ['seller'] });
    if (!fabric) throw new NotFoundException(`Fabric ${id} not found`);
    if (role !== UserRole.ADMIN && fabric.seller?.id !== sellerId) {
      throw new ForbiddenException('You can only update stock for your own fabrics');
    }
    fabric.stock = quantity;
    return this.fabricRepo.save(fabric);
  }

  async getLowStockItems(sellerId: string): Promise<Fabric[]> {
    return this.fabricRepo
      .createQueryBuilder('fabric')
      .leftJoinAndSelect('fabric.seller', 'seller')
      .where('seller.id = :sellerId', { sellerId })
      .andWhere('fabric.isActive = true')
      .andWhere('fabric.trackInventory = true')
      .andWhere('fabric.stock <= fabric.lowStockThreshold')
      .getMany();
  }

  async findFeatured(): Promise<Fabric[]> {
    return this.fabricRepo.find({
      where: { isFeatured: true, isActive: true },
      relations: ['seller'],
      order: { createdAt: 'DESC' },
    });
  }

  async toggleFeatured(id: string): Promise<Fabric> {
    const fabric = await this.fabricRepo.findOne({ where: { id } });
    if (!fabric) throw new NotFoundException(`Fabric ${id} not found`);
    fabric.isFeatured = !fabric.isFeatured;
    return this.fabricRepo.save(fabric);
  }
}
