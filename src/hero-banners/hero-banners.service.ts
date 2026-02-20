import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroBanner } from './entities/hero-banner.entity';
import { CreateHeroBannerDto } from './dto/create-hero-banner.dto';
import { UpdateHeroBannerDto } from './dto/update-hero-banner.dto';

@Injectable()
export class HeroBannersService {
  constructor(
    @InjectRepository(HeroBanner)
    private readonly bannerRepo: Repository<HeroBanner>,
  ) {}

  async findAllActive(): Promise<HeroBanner[]> {
    return this.bannerRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findAll(): Promise<HeroBanner[]> {
    return this.bannerRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async create(dto: CreateHeroBannerDto): Promise<HeroBanner> {
    const banner = this.bannerRepo.create(dto);
    return this.bannerRepo.save(banner);
  }

  async update(id: string, dto: UpdateHeroBannerDto): Promise<HeroBanner> {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException(`HeroBanner ${id} not found`);
    Object.assign(banner, dto);
    return this.bannerRepo.save(banner);
  }

  async remove(id: string): Promise<void> {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException(`HeroBanner ${id} not found`);
    await this.bannerRepo.remove(banner);
  }

  async toggle(id: string): Promise<HeroBanner> {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException(`HeroBanner ${id} not found`);
    banner.isActive = !banner.isActive;
    return this.bannerRepo.save(banner);
  }

  async reorder(orders: { id: string; sortOrder: number }[]): Promise<void> {
    // Verify all IDs exist before updating
    const ids = orders.map((o) => o.id);
    const banners = await this.bannerRepo.findByIds(ids);
    if (banners.length !== ids.length) {
      throw new NotFoundException('One or more banner IDs not found');
    }
    await Promise.all(
      orders.map(({ id, sortOrder }) =>
        this.bannerRepo.update(id, { sortOrder }),
      ),
    );
  }
}
