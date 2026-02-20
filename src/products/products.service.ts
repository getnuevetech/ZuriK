import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto, SortBy } from './dto/search-product.dto';
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

  async search(dto: SearchProductDto) {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 20, 100);
    const offset = (page - 1) * limit;

    const qb = this.productRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.designer', 'designer')
      .where('product.isActive = :isActive', { isActive: true });

    if (dto.q) {
      qb.andWhere(
        '(product.name ILIKE :q OR product.description ILIKE :q OR product.category ILIKE :q OR product.fabricType ILIKE :q)',
        { q: `%${dto.q}%` },
      );
    }
    if (dto.category) {
      qb.andWhere('product.category ILIKE :category', { category: dto.category });
    }
    if (dto.fabricType) {
      qb.andWhere('product.fabricType ILIKE :fabricType', { fabricType: dto.fabricType });
    }
    if (dto.region) {
      qb.andWhere('product.region ILIKE :region', { region: dto.region });
    }
    if (dto.designerId) {
      qb.andWhere('designer.id = :designerId', { designerId: dto.designerId });
    }
    if (dto.minPrice !== undefined) {
      qb.andWhere('product.customerPrice >= :minPrice', { minPrice: dto.minPrice });
    }
    if (dto.maxPrice !== undefined) {
      qb.andWhere('product.customerPrice <= :maxPrice', { maxPrice: dto.maxPrice });
    }
    if (dto.inStock !== undefined) {
      qb.andWhere('product.inStock = :inStock', { inStock: dto.inStock });
    }
    if (dto.sizes && dto.sizes.length > 0) {
      const sizeClauses = dto.sizes.map((s, i) => `product.sizes LIKE :size${i}`);
      const sizeParams: Record<string, string> = {};
      dto.sizes.forEach((s, i) => { sizeParams[`size${i}`] = `%${s}%`; });
      qb.andWhere(`(${sizeClauses.join(' OR ')})`, sizeParams);
    }

    switch (dto.sortBy) {
      case SortBy.PRICE_ASC:
        qb.orderBy('product.customerPrice', 'ASC');
        break;
      case SortBy.PRICE_DESC:
        qb.orderBy('product.customerPrice', 'DESC');
        break;
      case SortBy.NAME_ASC:
        qb.orderBy('product.name', 'ASC');
        break;
      case SortBy.NAME_DESC:
        qb.orderBy('product.name', 'DESC');
        break;
      default:
        qb.orderBy('product.createdAt', 'DESC');
    }

    const total = await qb.getCount();
    const products = await qb.skip(offset).take(limit).getMany();

    // Build facets from a separate (unfiltered-by-category/fabric) query for counts
    const allActive = await this.productRepo.find({ where: { isActive: true }, select: ['category', 'fabricType', 'region', 'customerPrice', 'sizes'] });

    const countMap = <T extends string>(items: (T | null | undefined)[]): { name: string; count: number }[] => {
      const map = new Map<string, number>();
      for (const item of items) {
        if (item) map.set(item, (map.get(item) ?? 0) + 1);
      }
      return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    };

    const prices = allActive.map((p) => Number(p.customerPrice)).filter((p) => !isNaN(p));
    const allSizes = allActive.flatMap((p) => p.sizes ?? []);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      filters: {
        categories: countMap(allActive.map((p) => p.category)),
        fabricTypes: countMap(allActive.map((p) => p.fabricType)),
        regions: countMap(allActive.map((p) => p.region)),
        priceRange: {
          min: prices.length ? Math.min(...prices) : 0,
          max: prices.length ? Math.max(...prices) : 0,
        },
        sizes: countMap(allSizes),
      },
    };
  }

  async getSuggestions(q: string) {
    if (!q || q.trim().length < 2) {
      return { products: [], categories: [], designers: [] };
    }

    const pattern = `%${q.trim()}%`;

    const products = await this.productRepo.createQueryBuilder('product')
      .select(['product.id', 'product.name', 'product.images', 'product.customerPrice'])
      .where('product.isActive = true AND product.name ILIKE :q', { q: pattern })
      .limit(6)
      .getMany();

    const categoryRows = await this.productRepo.createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .where('product.isActive = true AND product.category ILIKE :q', { q: pattern })
      .limit(5)
      .getRawMany<{ category: string }>();

    const designerRows = await this.productRepo.createQueryBuilder('product')
      .leftJoin('product.designer', 'designer')
      .select(['designer.id AS id', 'designer.firstName AS firstName', 'designer.lastName AS lastName'])
      .where('product.isActive = true AND (designer.firstName ILIKE :q OR designer.lastName ILIKE :q)', { q: pattern })
      .limit(4)
      .getRawMany<{ id: string; firstName: string; lastName: string }>();

    const uniqueDesigners = Array.from(
      new Map(designerRows.filter((d) => d.id).map((d) => [d.id, d])).values(),
    ).map((d) => ({ id: d.id, name: [d.firstName, d.lastName].filter(Boolean).join(' ') }));

    return {
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        image: p.images?.[0] ?? null,
        price: Number(p.customerPrice),
      })),
      categories: categoryRows.map((r) => r.category).filter(Boolean),
      designers: uniqueDesigners,
    };
  }

  async getTrending() {
    const products = await this.productRepo.find({
      where: { isActive: true },
      relations: ['designer'],
      order: { createdAt: 'DESC' },
      take: 8,
    });
    return { products };
  }
}
