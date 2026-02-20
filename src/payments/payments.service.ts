import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentGateway } from './entities/payment-gateway.entity';
import { CreateGatewayDto } from './dto/create-gateway.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentGateway)
    private readonly gatewayRepo: Repository<PaymentGateway>,
  ) {}

  async create(dto: CreateGatewayDto): Promise<PaymentGateway> {
    const gateway = this.gatewayRepo.create(dto);
    return this.gatewayRepo.save(gateway);
  }

  async findAll(): Promise<PaymentGateway[]> {
    return this.gatewayRepo.find({ order: { priority: 'DESC' } });
  }

  async update(id: string, dto: Partial<CreateGatewayDto>): Promise<PaymentGateway> {
    const gateway = await this.gatewayRepo.findOne({ where: { id } });
    if (!gateway) throw new NotFoundException(`Gateway ${id} not found`);
    Object.assign(gateway, dto);
    return this.gatewayRepo.save(gateway);
  }
}
