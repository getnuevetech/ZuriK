import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fabric } from './entities/fabric.entity';
import { CreateFabricDto } from './dto/create-fabric.dto';
import { UpdateFabricDto } from './dto/update-fabric.dto';
import { UserRole } from '../user/user.entity';

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
      price: dto.customerPrice,
    });
    return this.fabricRepo.save(fabric);
  }

  async findAll(): Promise<Fabric[]> {
    return this.fabricRepo.find({
      where: { isActive: true },
      relations: ['seller'],
    });
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
    if (dto.customerPrice) fabric.price = dto.customerPrice;
    return this.fabricRepo.save(fabric);
  }
}
