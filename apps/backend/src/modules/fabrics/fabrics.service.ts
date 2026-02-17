import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fabric } from '../../database/entities/fabric.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { CreateFabricDto } from './dto/create-fabric.dto';
import { UpdateFabricDto } from './dto/update-fabric.dto';

@Injectable()
export class FabricsService {
  constructor(
    @InjectRepository(Fabric)
    private readonly fabricRepository: Repository<Fabric>,
  ) {}

  async findAll(filters?: any): Promise<Fabric[]> {
    const query = this.fabricRepository
      .createQueryBuilder('fabric')
      .leftJoinAndSelect('fabric.seller', 'seller')
      .where('fabric.isActive = :isActive', { isActive: true });

    if (filters?.fabricType) {
      query.andWhere('fabric.fabricType = :fabricType', { fabricType: filters.fabricType });
    }

    if (filters?.country) {
      query.andWhere('fabric.country = :country', { country: filters.country });
    }

    if (filters?.sellerId) {
      query.andWhere('fabric.sellerId = :sellerId', { sellerId: filters.sellerId });
    }

    if (filters?.minPrice) {
      query.andWhere('fabric.pricePerMeter >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters?.maxPrice) {
      query.andWhere('fabric.pricePerMeter <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters?.inStock) {
      query.andWhere('fabric.stockQuantity > 0');
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Fabric> {
    const fabric = await this.fabricRepository.findOne({
      where: { id },
      relations: ['seller'],
    });

    if (!fabric) {
      throw new NotFoundException('Fabric not found');
    }

    return fabric;
  }

  async create(createFabricDto: CreateFabricDto, user: User): Promise<Fabric> {
    const fabric = this.fabricRepository.create({
      ...createFabricDto,
      sellerId: user.id,
    });

    return this.fabricRepository.save(fabric);
  }

  async update(id: string, updateFabricDto: UpdateFabricDto, user: User): Promise<Fabric> {
    const fabric = await this.fabricRepository.findOne({ where: { id } });

    if (!fabric) {
      throw new NotFoundException('Fabric not found');
    }

    if (fabric.sellerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only update your own fabric listings');
    }

    Object.assign(fabric, updateFabricDto);
    return this.fabricRepository.save(fabric);
  }

  async remove(id: string, user: User): Promise<void> {
    const fabric = await this.fabricRepository.findOne({ where: { id } });

    if (!fabric) {
      throw new NotFoundException('Fabric not found');
    }

    if (fabric.sellerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own fabric listings');
    }

    fabric.isActive = false;
    await this.fabricRepository.save(fabric);
  }

  async updateStock(id: string, quantity: number): Promise<Fabric> {
    const fabric = await this.fabricRepository.findOne({ where: { id } });

    if (!fabric) {
      throw new NotFoundException('Fabric not found');
    }

    if (fabric.stockQuantity < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    fabric.stockQuantity -= quantity;
    return this.fabricRepository.save(fabric);
  }
}
