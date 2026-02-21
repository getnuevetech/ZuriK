import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { Fabric } from '../fabrics/entities/fabric.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Fabric)
    private readonly fabricRepo: Repository<Fabric>,
  ) {}

  async search(q: string, type: 'all' | 'products' | 'fabrics' = 'all', limit = 10) {
    const safeLimit = Math.min(limit, 50);
    const searchTerm = `%${q}%`;

    const [products, fabrics] = await Promise.all([
      type !== 'fabrics'
        ? this.productRepo
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.designer', 'designer')
            .where('product.isActive = :isActive', { isActive: true })
            .andWhere('(product.name ILIKE :search OR product.description ILIKE :search)', { search: searchTerm })
            .orderBy('product.createdAt', 'DESC')
            .take(safeLimit)
            .getMany()
        : Promise.resolve([]),
      type !== 'products'
        ? this.fabricRepo
            .createQueryBuilder('fabric')
            .leftJoinAndSelect('fabric.seller', 'seller')
            .where('fabric.isActive = :isActive', { isActive: true })
            .andWhere('(fabric.name ILIKE :search OR fabric.description ILIKE :search)', { search: searchTerm })
            .orderBy('fabric.createdAt', 'DESC')
            .take(safeLimit)
            .getMany()
        : Promise.resolve([]),
    ]);

    return {
      products,
      fabrics,
      total: products.length + fabrics.length,
    };
  }
}
