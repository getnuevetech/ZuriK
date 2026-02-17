import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Measurement } from '../../database/entities/measurement.entity';
import { User } from '../../database/entities/user.entity';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';

@Injectable()
export class MeasurementsService {
  constructor(
    @InjectRepository(Measurement)
    private readonly measurementRepository: Repository<Measurement>,
  ) {}

  async findUserMeasurements(userId: string): Promise<Measurement[]> {
    return this.measurementRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User): Promise<Measurement> {
    const measurement = await this.measurementRepository.findOne({
      where: { id },
    });

    if (!measurement) {
      throw new NotFoundException('Measurement not found');
    }

    if (measurement.userId !== user.id) {
      throw new ForbiddenException('You can only view your own measurements');
    }

    return measurement;
  }

  async create(createMeasurementDto: CreateMeasurementDto, user: User): Promise<Measurement> {
    if (createMeasurementDto.isDefault) {
      await this.measurementRepository.update(
        { userId: user.id, isDefault: true },
        { isDefault: false },
      );
    }

    const measurement = this.measurementRepository.create({
      ...createMeasurementDto,
      userId: user.id,
    });

    return this.measurementRepository.save(measurement);
  }

  async update(
    id: string,
    updateMeasurementDto: UpdateMeasurementDto,
    user: User,
  ): Promise<Measurement> {
    const measurement = await this.measurementRepository.findOne({
      where: { id },
    });

    if (!measurement) {
      throw new NotFoundException('Measurement not found');
    }

    if (measurement.userId !== user.id) {
      throw new ForbiddenException('You can only update your own measurements');
    }

    if (updateMeasurementDto.isDefault) {
      await this.measurementRepository.update(
        { userId: user.id, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(measurement, updateMeasurementDto);
    return this.measurementRepository.save(measurement);
  }

  async remove(id: string, user: User): Promise<void> {
    const measurement = await this.measurementRepository.findOne({
      where: { id },
    });

    if (!measurement) {
      throw new NotFoundException('Measurement not found');
    }

    if (measurement.userId !== user.id) {
      throw new ForbiddenException('You can only delete your own measurements');
    }

    await this.measurementRepository.remove(measurement);
  }
}
