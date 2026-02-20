import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FeaturedSection, SelectionMode } from './entities/featured-section.entity';
import { Product } from '../products/entities/product.entity';
import { CreateFeaturedSectionDto } from './dto/create-featured-section.dto';

@Injectable()
export class FeaturedService {
  constructor(
    @InjectRepository(FeaturedSection)
    private readonly sectionRepo: Repository<FeaturedSection>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async createSection(dto: CreateFeaturedSectionDto): Promise<FeaturedSection> {
    const section = this.sectionRepo.create(dto);
    return this.sectionRepo.save(section);
  }

  async updateSection(id: string, dto: Partial<CreateFeaturedSectionDto>): Promise<FeaturedSection> {
    const section = await this.sectionRepo.findOne({ where: { id } });
    if (!section) throw new NotFoundException(`Featured section ${id} not found`);
    Object.assign(section, dto);
    return this.sectionRepo.save(section);
  }

  async deleteSection(id: string): Promise<void> {
    const section = await this.sectionRepo.findOne({ where: { id } });
    if (!section) throw new NotFoundException(`Featured section ${id} not found`);
    await this.sectionRepo.remove(section);
  }

  async getSections(): Promise<FeaturedSection[]> {
    return this.sectionRepo.find({ order: { displayOrder: 'ASC' } });
  }

  async getActiveSections(): Promise<FeaturedSection[]> {
    return this.sectionRepo.find({ where: { isActive: true }, order: { displayOrder: 'ASC' } });
  }

  async getSectionProducts(sectionId: string): Promise<Product[]> {
    const section = await this.sectionRepo.findOne({ where: { id: sectionId } });
    if (!section) throw new NotFoundException(`Featured section ${sectionId} not found`);
    return this.resolveProducts(section);
  }

  private async resolveProducts(section: FeaturedSection): Promise<Product[]> {
    const limit = section.maxRows * 4;
    const where = section.category
      ? { isActive: true, category: section.category }
      : { isActive: true };

    switch (section.selectionMode) {
      case SelectionMode.MANUAL:
        if (!section.manualProductIds?.length) return [];
        return this.productRepo.find({ where: { id: In(section.manualProductIds), isActive: true } });

      case SelectionMode.AUTO_BESTSELLING:
        return this.productRepo
          .createQueryBuilder('product')
          .leftJoinAndSelect('product.designer', 'designer')
          .where('product.isActive = :isActive', { isActive: true })
          .andWhere(section.category ? 'product.category = :category' : '1=1', { category: section.category })
          .orderBy('product.totalReviews', 'DESC')
          .limit(limit)
          .getMany();

      case SelectionMode.AUTO_HIGHEST_RATED:
        return this.productRepo
          .createQueryBuilder('product')
          .leftJoinAndSelect('product.designer', 'designer')
          .where('product.isActive = :isActive', { isActive: true })
          .andWhere(section.category ? 'product.category = :category' : '1=1', { category: section.category })
          .orderBy('product.averageRating', 'DESC')
          .limit(limit)
          .getMany();

      case SelectionMode.AUTO_NEWEST:
      default:
        return this.productRepo.find({ where, order: { createdAt: 'DESC' }, take: limit, relations: ['designer'] });
    }
  }

  async getHomepageFeatured(): Promise<{ section: FeaturedSection; products: Product[] }[]> {
    const sections = await this.getActiveSections();
    return Promise.all(
      sections.map(async (section) => ({
        section,
        products: await this.resolveProducts(section),
      })),
    );
  }

  async reorderSections(orderedIds: string[]): Promise<void> {
    await Promise.all(
      orderedIds.map((id, index) => this.sectionRepo.update(id, { displayOrder: index })),
    );
  }
}
