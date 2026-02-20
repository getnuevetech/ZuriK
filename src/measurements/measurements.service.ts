import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Measurement } from './entities/measurement.entity';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';

@Injectable()
export class MeasurementsService {
  constructor(
    @InjectRepository(Measurement)
    private readonly measurementRepo: Repository<Measurement>,
  ) {}

  async create(customerId: string, dto: CreateMeasurementDto): Promise<Measurement> {
    const measurement = this.measurementRepo.create({
      customer: { id: customerId },
      ...dto,
    });
    return this.measurementRepo.save(measurement);
  }

  async findAllForCustomer(customerId: string): Promise<Measurement[]> {
    return this.measurementRepo.find({
      where: { customer: { id: customerId } },
    });
  }

  async findDefault(customerId: string): Promise<Measurement | null> {
    return this.measurementRepo.findOne({
      where: { customer: { id: customerId }, isDefault: true },
    });
  }

  async update(
    id: string,
    customerId: string,
    dto: UpdateMeasurementDto,
  ): Promise<Measurement> {
    const measurement = await this.measurementRepo.findOne({
      where: { id },
      relations: ['customer'],
    });
    if (!measurement) {
      throw new NotFoundException(`Measurement ${id} not found`);
    }
    if (measurement.customer.id !== customerId) {
      throw new ForbiddenException('You do not own this measurement');
    }
    Object.assign(measurement, dto);
    return this.measurementRepo.save(measurement);
  }

  async remove(id: string, customerId: string): Promise<void> {
    const measurement = await this.measurementRepo.findOne({
      where: { id },
      relations: ['customer'],
    });
    if (!measurement) {
      throw new NotFoundException(`Measurement ${id} not found`);
    }
    if (measurement.customer.id !== customerId) {
      throw new ForbiddenException('You do not own this measurement');
    }
    await this.measurementRepo.remove(measurement);
  }
}
