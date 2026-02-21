import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FeaturedSection, SelectionMode } from './entities/featured-section.entity';
import { CountryHero } from './entities/country-hero.entity';
import { CollectionDisplay } from './entities/collection-display.entity';
import { ThemeSettings, ThemeKey } from './entities/theme-settings.entity';
import { HomepageLayout } from './entities/homepage-layout.entity';
import { PromoBanner } from './entities/promo-banner.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { CreateFeaturedSectionDto } from './dto/create-featured-section.dto';
import { UpdateFeaturedSectionDto } from './dto/update-featured-section.dto';
import { CreateCountryHeroDto } from './dto/create-country-hero.dto';
import { UpdateCountryHeroDto } from './dto/update-country-hero.dto';
import { CreateCollectionDisplayDto } from './dto/create-collection-display.dto';
import { UpdateCollectionDisplayDto } from './dto/update-collection-display.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { UpdateHomepageLayoutDto } from './dto/update-homepage-layout.dto';
import { CreatePromoBannerDto } from './dto/create-promo-banner.dto';
import { UpdatePromoBannerDto } from './dto/update-promo-banner.dto';
import { THEME_PRESETS } from './theme-presets.config';

@Injectable()
export class HomepageService {
  constructor(
    @InjectRepository(FeaturedSection)
    private featuredRepo: Repository<FeaturedSection>,
    @InjectRepository(CountryHero)
    private countryHeroRepo: Repository<CountryHero>,
    @InjectRepository(CollectionDisplay)
    private collectionRepo: Repository<CollectionDisplay>,
    @InjectRepository(ThemeSettings)
    private themeRepo: Repository<ThemeSettings>,
    @InjectRepository(HomepageLayout)
    private layoutRepo: Repository<HomepageLayout>,
    @InjectRepository(PromoBanner)
    private promoBannerRepo: Repository<PromoBanner>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  // ─── Featured Sections ───────────────────────────────────────────────────────

  async createFeaturedSection(dto: CreateFeaturedSectionDto): Promise<FeaturedSection> {
    const section = this.featuredRepo.create(dto);
    return this.featuredRepo.save(section);
  }

  async updateFeaturedSection(id: string, dto: UpdateFeaturedSectionDto): Promise<FeaturedSection> {
    const section = await this.featuredRepo.findOne({ where: { id } });
    if (!section) throw new NotFoundException('Featured section not found');
    Object.assign(section, dto);
    return this.featuredRepo.save(section);
  }

  async deleteFeaturedSection(id: string): Promise<void> {
    const section = await this.featuredRepo.findOne({ where: { id } });
    if (!section) throw new NotFoundException('Featured section not found');
    await this.featuredRepo.remove(section);
  }

  async getFeaturedSections(): Promise<FeaturedSection[]> {
    return this.featuredRepo.find({ order: { displayOrder: 'ASC' } });
  }

  async getFeaturedProductsForHomepage(): Promise<{ section: FeaturedSection; products: Product[] }[]> {
    const sections = await this.featuredRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });

    return Promise.all(
      sections.map(async (section) => {
        const limit = section.maxRows * 4;
        let products: Product[] = [];

        if (section.selectionMode === SelectionMode.MANUAL) {
          if (section.manualProductIds?.length) {
            products = await this.productRepo.find({
              where: { id: In(section.manualProductIds), isActive: true },
            });
          }
        } else if (section.selectionMode === SelectionMode.AUTO_NEWEST) {
          const qb = this.productRepo.createQueryBuilder('p')
            .where('p.isActive = :active', { active: true })
            .orderBy('p.createdAt', 'DESC')
            .limit(limit);
          if (section.category) qb.andWhere('p.category = :cat', { cat: section.category });
          products = await qb.getMany();
        } else if (section.selectionMode === SelectionMode.AUTO_BEST_SELLING) {
          const qb = this.productRepo.createQueryBuilder('p')
            .leftJoin('orders', 'o', 'o.designId = p.id')
            .where('p.isActive = :active', { active: true })
            .groupBy('p.id')
            .orderBy('COUNT(o.id)', 'DESC')
            .limit(limit);
          if (section.category) qb.andWhere('p.category = :cat', { cat: section.category });
          products = await qb.getMany();
        } else if (section.selectionMode === SelectionMode.AUTO_HIGHEST_RATED) {
          const qb = this.productRepo.createQueryBuilder('p')
            .where('p.isActive = :active', { active: true })
            .orderBy('p.averageRating', 'DESC')
            .limit(limit);
          if (section.category) qb.andWhere('p.category = :cat', { cat: section.category });
          products = await qb.getMany();
        }

        return { section, products };
      }),
    );
  }

  // ─── Country Heroes ───────────────────────────────────────────────────────────

  async createCountryHero(dto: CreateCountryHeroDto): Promise<CountryHero> {
    const hero = this.countryHeroRepo.create(dto);
    return this.countryHeroRepo.save(hero);
  }

  async updateCountryHero(id: string, dto: UpdateCountryHeroDto): Promise<CountryHero> {
    const hero = await this.countryHeroRepo.findOne({ where: { id } });
    if (!hero) throw new NotFoundException('Country hero not found');
    Object.assign(hero, dto);
    return this.countryHeroRepo.save(hero);
  }

  async deleteCountryHero(id: string): Promise<void> {
    const hero = await this.countryHeroRepo.findOne({ where: { id } });
    if (!hero) throw new NotFoundException('Country hero not found');
    await this.countryHeroRepo.remove(hero);
  }

  async getCountryHeroes(): Promise<CountryHero[]> {
    return this.countryHeroRepo.find({ order: { displayOrder: 'ASC' } });
  }

  async getActiveCountryHeroes(): Promise<CountryHero[]> {
    return this.countryHeroRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  // ─── Collection Displays ─────────────────────────────────────────────────────

  async createCollectionDisplay(dto: CreateCollectionDisplayDto): Promise<CollectionDisplay> {
    const col = this.collectionRepo.create(dto);
    return this.collectionRepo.save(col);
  }

  async updateCollectionDisplay(id: string, dto: UpdateCollectionDisplayDto): Promise<CollectionDisplay> {
    const col = await this.collectionRepo.findOne({ where: { id } });
    if (!col) throw new NotFoundException('Collection display not found');
    Object.assign(col, dto);
    return this.collectionRepo.save(col);
  }

  async deleteCollectionDisplay(id: string): Promise<void> {
    const col = await this.collectionRepo.findOne({ where: { id } });
    if (!col) throw new NotFoundException('Collection display not found');
    await this.collectionRepo.remove(col);
  }

  async getCollectionDisplays(): Promise<CollectionDisplay[]> {
    return this.collectionRepo.find({ order: { displayOrder: 'ASC' } });
  }

  async getActiveCollections(): Promise<{ collection: CollectionDisplay; products: Product[] }[]> {
    const collections = await this.collectionRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });

    return Promise.all(
      collections.map(async (collection) => {
        let products: Product[] = [];
        if (collection.productIds?.length) {
          products = await this.productRepo.find({
            where: { id: In(collection.productIds), isActive: true },
          });
        } else if (collection.category) {
          products = await this.productRepo.find({
            where: { category: collection.category, isActive: true },
            take: 8,
          });
        }
        return { collection, products };
      }),
    );
  }

  // ─── Theme ───────────────────────────────────────────────────────────────────

  async getThemeSettings(): Promise<ThemeSettings> {
    let theme = await this.themeRepo.findOne({ where: {} });
    if (!theme) {
      theme = this.themeRepo.create({ activeTheme: ThemeKey.BOLD_VIBRANT });
      theme = await this.themeRepo.save(theme);
    }
    return theme;
  }

  async updateThemeSettings(dto: UpdateThemeDto): Promise<ThemeSettings> {
    let theme = await this.themeRepo.findOne({ where: {} });
    if (!theme) {
      theme = this.themeRepo.create({ activeTheme: ThemeKey.BOLD_VIBRANT });
    }
    Object.assign(theme, dto);
    return this.themeRepo.save(theme);
  }

  getThemePresets() {
    return THEME_PRESETS;
  }

  async getThemeColors(): Promise<Record<string, string>> {
    const theme = await this.getThemeSettings();
    const preset = THEME_PRESETS.find((p) => p.key === theme.activeTheme);
    const colors = preset ? { ...preset.colors } : { ...THEME_PRESETS[0].colors };
    if (theme.customOverrides) Object.assign(colors, theme.customOverrides);
    return colors;
  }

  // ─── Homepage Layout ──────────────────────────────────────────────────────────

  async getHomepageLayout(): Promise<HomepageLayout[]> {
    return this.layoutRepo.find({ order: { displayOrder: 'ASC' } });
  }

  async updateHomepageLayout(dto: UpdateHomepageLayoutDto): Promise<HomepageLayout[]> {
    await Promise.all(
      dto.sections.map((s) =>
        this.layoutRepo.upsert(
          { id: s.id, sectionType: s.sectionType, sectionId: s.sectionId, displayOrder: s.displayOrder, isActive: s.isActive },
          ['id'],
        ),
      ),
    );
    return this.getHomepageLayout();
  }

  // ─── Promo Banners ────────────────────────────────────────────────────────────

  async createPromoBanner(dto: CreatePromoBannerDto): Promise<PromoBanner> {
    const banner = this.promoBannerRepo.create(dto);
    return this.promoBannerRepo.save(banner);
  }

  async updatePromoBanner(id: string, dto: UpdatePromoBannerDto): Promise<PromoBanner> {
    const banner = await this.promoBannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Promo banner not found');
    Object.assign(banner, dto);
    return this.promoBannerRepo.save(banner);
  }

  async deletePromoBanner(id: string): Promise<void> {
    const banner = await this.promoBannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Promo banner not found');
    await this.promoBannerRepo.remove(banner);
  }

  async getPromoBanners(): Promise<PromoBanner[]> {
    return this.promoBannerRepo.find({ order: { displayOrder: 'ASC' } });
  }

  async getActivePromoBanners(): Promise<PromoBanner[]> {
    return this.promoBannerRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }
}
