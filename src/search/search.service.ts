import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Design } from '../designs/entities/design.entity';
import { ReadyToWearProduct } from '../ready-to-wear/entities/ready-to-wear-product.entity';
import { Fabric } from '../fabrics/entities/fabric.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Design)
    private readonly designRepo: Repository<Design>,
    @InjectRepository(ReadyToWearProduct)
    private readonly rtwRepo: Repository<ReadyToWearProduct>,
    @InjectRepository(Fabric)
    private readonly fabricRepo: Repository<Fabric>,
  ) {}

  async search(q: string, type: 'all' | 'designs' | 'ready-to-wear' | 'fabrics' = 'all', limit = 10) {
    const safeLimit = Math.min(limit, 50);
    const searchTerm = `%${q}%`;

    const [designs, readyToWear, fabrics] = await Promise.all([
      type === 'all' || type === 'designs'
        ? this.designRepo
            .createQueryBuilder('design')
            .leftJoinAndSelect('design.designer', 'designer')
            .where('design.isActive = :isActive', { isActive: true })
            .andWhere('(design.name ILIKE :search OR design.description ILIKE :search)', { search: searchTerm })
            .orderBy('design.createdAt', 'DESC')
            .take(safeLimit)
            .getMany()
        : Promise.resolve([]),
      type === 'all' || type === 'ready-to-wear'
        ? this.rtwRepo
            .createQueryBuilder('rtw')
            .leftJoinAndSelect('rtw.designer', 'designer')
            .where('rtw.isActive = :isActive', { isActive: true })
            .andWhere('(rtw.name ILIKE :search OR rtw.description ILIKE :search)', { search: searchTerm })
            .orderBy('rtw.createdAt', 'DESC')
            .take(safeLimit)
            .getMany()
        : Promise.resolve([]),
      type === 'all' || type === 'fabrics'
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
      designs,
      readyToWear,
      fabrics,
      total: designs.length + readyToWear.length + fabrics.length,
    };
  }
}
