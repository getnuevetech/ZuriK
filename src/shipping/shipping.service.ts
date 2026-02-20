import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingCarrier } from './entities/shipping-carrier.entity';
import { CreateCarrierDto } from './dto/create-carrier.dto';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingCarrier)
    private readonly carrierRepo: Repository<ShippingCarrier>,
  ) {}

  async create(dto: CreateCarrierDto): Promise<ShippingCarrier> {
    const carrier = this.carrierRepo.create(dto);
    return this.carrierRepo.save(carrier);
  }

  async findAll(): Promise<ShippingCarrier[]> {
    return this.carrierRepo.find({ order: { priority: 'DESC' } });
  }

  async update(id: string, dto: Partial<CreateCarrierDto>): Promise<ShippingCarrier> {
    const carrier = await this.carrierRepo.findOne({ where: { id } });
    if (!carrier) throw new NotFoundException(`Carrier ${id} not found`);
    Object.assign(carrier, dto);
    return this.carrierRepo.save(carrier);
  }
}
