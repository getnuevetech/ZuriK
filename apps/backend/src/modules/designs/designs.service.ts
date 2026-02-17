import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Design } from '../../database/entities/design.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { CreateDesignDto } from './dto/create-design.dto';
import { UpdateDesignDto } from './dto/update-design.dto';

@Injectable()
export class DesignsService {
  constructor(
    @InjectRepository(Design)
    private readonly designRepository: Repository<Design>,
  ) {}

  async findAll(filters?: any): Promise<Design[]> {
    const query = this.designRepository
      .createQueryBuilder('design')
      .leftJoinAndSelect('design.designer', 'designer')
      .leftJoinAndSelect('design.compatibleFabrics', 'fabrics')
      .where('design.isActive = :isActive', { isActive: true });

    if (filters?.category) {
      query.andWhere('design.category = :category', { category: filters.category });
    }

    if (filters?.country) {
      query.andWhere('design.country = :country', { country: filters.country });
    }

    if (filters?.designerId) {
      query.andWhere('design.designerId = :designerId', { designerId: filters.designerId });
    }

    if (filters?.minPrice) {
      query.andWhere('design.price >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters?.maxPrice) {
      query.andWhere('design.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Design> {
    const design = await this.designRepository.findOne({
      where: { id },
      relations: ['designer', 'compatibleFabrics'],
    });

    if (!design) {
      throw new NotFoundException('Design not found');
    }

    return design;
  }

  async create(createDesignDto: CreateDesignDto, user: User): Promise<Design> {
    const design = this.designRepository.create({
      ...createDesignDto,
      designerId: user.id,
    });

    return this.designRepository.save(design);
  }

  async update(id: string, updateDesignDto: UpdateDesignDto, user: User): Promise<Design> {
    const design = await this.designRepository.findOne({ where: { id } });

    if (!design) {
      throw new NotFoundException('Design not found');
    }

    if (design.designerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own designs');
    }

    Object.assign(design, updateDesignDto);
    return this.designRepository.save(design);
  }

  async remove(id: string, user: User): Promise<void> {
    const design = await this.designRepository.findOne({ where: { id } });

    if (!design) {
      throw new NotFoundException('Design not found');
    }

    if (design.designerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own designs');
    }

    design.isActive = false;
    await this.designRepository.save(design);
  }
}
