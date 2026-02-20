import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSettings, FeeType } from './entities/platform-settings.entity';
import { CreateSettingsDto } from './dto/create-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(PlatformSettings)
    private readonly settingsRepo: Repository<PlatformSettings>,
  ) {}

  async create(dto: CreateSettingsDto): Promise<PlatformSettings> {
    const settings = this.settingsRepo.create(dto);
    return this.settingsRepo.save(settings);
  }

  async findAll(): Promise<PlatformSettings[]> {
    return this.settingsRepo.find();
  }

  async findActive(): Promise<PlatformSettings | null> {
    return this.settingsRepo.findOne({ where: { isActive: true } });
  }

  async update(id: string, dto: Partial<CreateSettingsDto>): Promise<PlatformSettings> {
    const settings = await this.settingsRepo.findOne({ where: { id } });
    if (!settings) throw new NotFoundException(`Settings ${id} not found`);
    Object.assign(settings, dto);
    return this.settingsRepo.save(settings);
  }

  calculateFee(designPrice: number, fabricPrice: number, settings: PlatformSettings): number {
    const subtotal = designPrice + fabricPrice;
    switch (settings.platformFeeType) {
      case FeeType.FIXED:
        return Number(settings.fixedFee);
      case FeeType.PERCENTAGE:
        return (subtotal * Number(settings.percentageFee)) / 100;
      case FeeType.HYBRID:
        return Number(settings.fixedFee) + (subtotal * Number(settings.percentageFee)) / 100;
      default:
        return 0;
    }
  }

  async previewFee(designPrice: number, fabricPrice: number): Promise<object> {
    const settings = await this.findActive();
    if (!settings) return { error: 'No active settings found' };
    const fee = this.calculateFee(designPrice, fabricPrice, settings);
    return {
      designPrice,
      fabricPrice,
      subtotal: designPrice + fabricPrice,
      platformFee: fee,
      total: designPrice + fabricPrice + fee,
      feeType: settings.platformFeeType,
    };
  }
}
