import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FeaturedSection, SelectionMode } from './entities/featured-section.entity';
import { CountryHero } from './entities/country-hero.entity';
import { CollectionDisplay } from './entities/collection-display.entity';
import { ThemeSettings, ThemeKey } from './entities/theme-settings.entity';
import { HomepageLayout } from './entities/homepage-layout.entity';
import { PromoBanner } from './entities/promo-banner.entity';
import { CollectionPost } from './entities/collection-post.entity';
import { HeritageStory } from './entities/heritage-story.entity';
import { HowItWorksStep } from './entities/how-it-works-step.entity';
import { TryOnConfig } from './entities/tryon-config.entity';
import { HeroStat } from './entities/hero-stat.entity';
import { Design } from '../designs/entities/design.entity';
import { ReadyToWearProduct } from '../ready-to-wear/entities/ready-to-wear-product.entity';
import { Order } from '../orders/entities/order.entity';
import { User, UserRole } from '../users/entities/user.entity';
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
import { CreateCollectionPostDto } from './dto/create-collection-post.dto';
import { UpdateCollectionPostDto } from './dto/update-collection-post.dto';
import { CreateHeritageStoryDto } from './dto/create-heritage-story.dto';
import { UpdateHeritageStoryDto } from './dto/update-heritage-story.dto';
import { CreateHowItWorksStepDto } from './dto/create-how-it-works-step.dto';
import { UpdateHowItWorksStepDto } from './dto/update-how-it-works-step.dto';
import { UpdateTryOnConfigDto } from './dto/update-tryon-config.dto';
import { CreateHeroStatDto } from './dto/create-hero-stat.dto';
import { UpdateHeroStatDto } from './dto/update-hero-stat.dto';
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
    @InjectRepository(CollectionPost)
    private collectionPostRepo: Repository<CollectionPost>,
    @InjectRepository(HeritageStory)
    private heritageStoryRepo: Repository<HeritageStory>,
    @InjectRepository(HowItWorksStep)
    private howItWorksRepo: Repository<HowItWorksStep>,
    @InjectRepository(TryOnConfig)
    private tryOnConfigRepo: Repository<TryOnConfig>,
    @InjectRepository(HeroStat)
    private heroStatRepo: Repository<HeroStat>,
    @InjectRepository(Design)
    private designRepo: Repository<Design>,
    @InjectRepository(ReadyToWearProduct)
    private rtwRepo: Repository<ReadyToWearProduct>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
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

  async getFeaturedProductsForHomepage(): Promise<{ section: FeaturedSection; items: (Design | ReadyToWearProduct)[] }[]> {
    const sections = await this.featuredRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });

    return Promise.all(
      sections.map(async (section) => {
        const limit = section.maxRows * 4;
        let items: (Design | ReadyToWearProduct)[] = [];

        if (section.selectionMode === SelectionMode.MANUAL) {
          if (section.manualProductIds?.length) {
            const designs = await this.designRepo.find({
              where: { id: In(section.manualProductIds), isActive: true },
            });
            items = designs;
          }
        } else if (section.selectionMode === SelectionMode.AUTO_NEWEST) {
          const qb = this.designRepo.createQueryBuilder('p')
            .where('p.isActive = :active', { active: true })
            .orderBy('p.createdAt', 'DESC')
            .limit(limit);
          if (section.category) qb.andWhere('p.category = :cat', { cat: section.category });
          items = await qb.getMany();
        } else if (section.selectionMode === SelectionMode.AUTO_BEST_SELLING) {
          const qb = this.designRepo.createQueryBuilder('p')
            .where('p.isActive = :active', { active: true })
            .orderBy('p.totalReviews', 'DESC')
            .limit(limit);
          if (section.category) qb.andWhere('p.category = :cat', { cat: section.category });
          items = await qb.getMany();
        } else if (section.selectionMode === SelectionMode.AUTO_HIGHEST_RATED) {
          const qb = this.designRepo.createQueryBuilder('p')
            .where('p.isActive = :active', { active: true })
            .orderBy('p.averageRating', 'DESC')
            .limit(limit);
          if (section.category) qb.andWhere('p.category = :cat', { cat: section.category });
          items = await qb.getMany();
        }

        return { section, items };
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

  async getActiveCollections(): Promise<{ collection: CollectionDisplay; items: Design[] }[]> {
    const collections = await this.collectionRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });

    return Promise.all(
      collections.map(async (collection) => {
        let items: Design[] = [];
        if (collection.productIds?.length) {
          items = await this.designRepo.find({
            where: { id: In(collection.productIds), isActive: true },
          });
        } else if (collection.category) {
          items = await this.designRepo.find({
            where: { category: collection.category, isActive: true },
            take: 8,
          });
        }
        return { collection, items };
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

  // ─── Shop by Country ─────────────────────────────────────────────────────────

  async getShopByCountryData(): Promise<{
    countryName: string;
    countryCode: string;
    flag: string;
    fabrics: string[];
    subtitle: string | null;
    designerCount: number;
    sellerCount: number;
    productCount: number;
    heroImage: string | null;
  }[]> {
    const COUNTRY_FLAGS: Record<string, { code: string; flag: string }> = {
      Nigeria: { code: 'NG', flag: '🇳🇬' },
      Ghana: { code: 'GH', flag: '🇬🇭' },
      Kenya: { code: 'KE', flag: '🇰🇪' },
      'South Africa': { code: 'ZA', flag: '🇿🇦' },
      Ethiopia: { code: 'ET', flag: '🇪🇹' },
      Senegal: { code: 'SN', flag: '🇸🇳' },
      Tanzania: { code: 'TZ', flag: '🇹🇿' },
      Morocco: { code: 'MA', flag: '🇲🇦' },
      Cameroon: { code: 'CM', flag: '🇨🇲' },
      'Ivory Coast': { code: 'CI', flag: '🇨🇮' },
      Mali: { code: 'ML', flag: '🇲🇱' },
      'DR Congo': { code: 'CD', flag: '🇨🇩' },
    };

    // Get distinct countries from active designers/sellers
    const usersRaw = await this.userRepo
      .createQueryBuilder('u')
      .select('u.country', 'country')
      .addSelect('u.role', 'role')
      .addSelect('COUNT(u.id)', 'cnt')
      .where('u.isActive = :active', { active: true })
      .andWhere('u.role IN (:...roles)', { roles: [UserRole.DESIGNER, UserRole.FABRIC_SELLER] })
      .andWhere('u.country IS NOT NULL')
      .groupBy('u.country')
      .addGroupBy('u.role')
      .getRawMany();

    // Build country map
    const countryMap: Record<string, { designerCount: number; sellerCount: number }> = {};
    for (const row of usersRaw) {
      if (!row.country) continue;
      if (!countryMap[row.country]) countryMap[row.country] = { designerCount: 0, sellerCount: 0 };
      if (row.role === UserRole.DESIGNER) countryMap[row.country].designerCount += Number(row.cnt);
      if (row.role === UserRole.FABRIC_SELLER) countryMap[row.country].sellerCount += Number(row.cnt);
    }

    // Get design counts - derived from designer's country via join
    const designsRaw = await this.designRepo
      .createQueryBuilder('p')
      .leftJoin('p.designer', 'designer')
      .select('designer.country', 'country')
      .addSelect('COUNT(p.id)', 'cnt')
      .where('p.isActive = :active', { active: true })
      .andWhere('designer.country IS NOT NULL')
      .groupBy('designer.country')
      .getRawMany();

    const productCountMap: Record<string, number> = {};
    for (const row of designsRaw) {
      if (row.country) productCountMap[row.country] = Number(row.cnt);
    }

    // Get data from CountryHero records
    const heroes = await this.countryHeroRepo.find({ where: { isActive: true } });
    const heroImageMap: Record<string, string> = {};
    const heroFlagMap: Record<string, string> = {};
    const heroFabricsMap: Record<string, string[]> = {};
    const heroSubtitleMap: Record<string, string> = {};
    for (const h of heroes) {
      if (h.heroImages?.length) heroImageMap[h.countryName] = h.heroImages[0];
      if (h.flag) heroFlagMap[h.countryName] = h.flag;
      if (h.fabrics?.length) heroFabricsMap[h.countryName] = h.fabrics;
      if (h.subtitle) heroSubtitleMap[h.countryName] = h.subtitle;
    }

    const countries = Object.keys(countryMap);
    const result = countries.map((countryName) => ({
      countryName,
      countryCode: COUNTRY_FLAGS[countryName]?.code ?? '',
      flag: heroFlagMap[countryName] ?? COUNTRY_FLAGS[countryName]?.flag ?? '',
      fabrics: heroFabricsMap[countryName] ?? [],
      subtitle: heroSubtitleMap[countryName] ?? null,
      designerCount: countryMap[countryName].designerCount,
      sellerCount: countryMap[countryName].sellerCount,
      productCount: productCountMap[countryName] ?? 0,
      heroImage: heroImageMap[countryName] ?? null,
    }));

    return result.sort((a, b) => b.productCount - a.productCount);
  }

  // ─── Trending Products ────────────────────────────────────────────────────────

  async getTrendingProducts(limit = 10): Promise<Design[]> {
    const trending = await this.designRepo
      .createQueryBuilder('p')
      .where('p.isActive = :active', { active: true })
      .orderBy('p.totalReviews', 'DESC')
      .limit(limit)
      .getMany();

    if (trending.length > 0) return trending;

    // Fallback to highest-rated designs
    return this.designRepo.find({
      where: { isActive: true },
      order: { averageRating: 'DESC' },
      take: limit,
    });
  }

  // ─── Collection Posts ─────────────────────────────────────────────────────────

  async createCollectionPost(dto: CreateCollectionPostDto): Promise<CollectionPost> {
    const post = this.collectionPostRepo.create(dto);
    return this.collectionPostRepo.save(post);
  }

  async updateCollectionPost(id: string, dto: UpdateCollectionPostDto): Promise<CollectionPost> {
    const post = await this.collectionPostRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Collection post not found');
    Object.assign(post, dto);
    return this.collectionPostRepo.save(post);
  }

  async deleteCollectionPost(id: string): Promise<void> {
    const post = await this.collectionPostRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Collection post not found');
    await this.collectionPostRepo.remove(post);
  }

  async getCollectionPosts(): Promise<CollectionPost[]> {
    return this.collectionPostRepo.find({ order: { displayOrder: 'ASC' } });
  }

  async getActiveCollectionPosts(): Promise<CollectionPost[]> {
    return this.collectionPostRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  // ─── Heritage Stories ─────────────────────────────────────────────────────────

  async createHeritageStory(dto: CreateHeritageStoryDto): Promise<HeritageStory> {
    const story = this.heritageStoryRepo.create(dto);
    return this.heritageStoryRepo.save(story);
  }

  async updateHeritageStory(id: string, dto: UpdateHeritageStoryDto): Promise<HeritageStory> {
    const story = await this.heritageStoryRepo.findOne({ where: { id } });
    if (!story) throw new NotFoundException('Heritage story not found');
    Object.assign(story, dto);
    return this.heritageStoryRepo.save(story);
  }

  async deleteHeritageStory(id: string): Promise<void> {
    const story = await this.heritageStoryRepo.findOne({ where: { id } });
    if (!story) throw new NotFoundException('Heritage story not found');
    await this.heritageStoryRepo.remove(story);
  }

  async getHeritageStories(): Promise<HeritageStory[]> {
    return this.heritageStoryRepo.find({ order: { displayOrder: 'ASC' } });
  }

  async getActiveHeritageStories(): Promise<HeritageStory[]> {
    return this.heritageStoryRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  // ─── How It Works Steps ───────────────────────────────────────────────────────

  async createHowItWorksStep(dto: CreateHowItWorksStepDto): Promise<HowItWorksStep> {
    const step = this.howItWorksRepo.create(dto);
    return this.howItWorksRepo.save(step);
  }

  async updateHowItWorksStep(id: string, dto: UpdateHowItWorksStepDto): Promise<HowItWorksStep> {
    const step = await this.howItWorksRepo.findOne({ where: { id } });
    if (!step) throw new NotFoundException('How It Works step not found');
    Object.assign(step, dto);
    return this.howItWorksRepo.save(step);
  }

  async deleteHowItWorksStep(id: string): Promise<void> {
    const step = await this.howItWorksRepo.findOne({ where: { id } });
    if (!step) throw new NotFoundException('How It Works step not found');
    await this.howItWorksRepo.remove(step);
  }

  async getHowItWorksSteps(): Promise<HowItWorksStep[]> {
    return this.howItWorksRepo.find({ order: { displayOrder: 'ASC', stepNumber: 'ASC' } });
  }

  async getActiveHowItWorksSteps(): Promise<HowItWorksStep[]> {
    return this.howItWorksRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', stepNumber: 'ASC' },
    });
  }

  // ─── TryOn Config ─────────────────────────────────────────────────────────────

  async getTryOnConfig(): Promise<TryOnConfig | null> {
    const configs = await this.tryOnConfigRepo.find({ take: 1 });
    return configs[0] ?? null;
  }

  async upsertTryOnConfig(dto: UpdateTryOnConfigDto): Promise<TryOnConfig> {
    const existing = await this.tryOnConfigRepo.find({ take: 1 });
    if (existing.length > 0) {
      Object.assign(existing[0], dto);
      return this.tryOnConfigRepo.save(existing[0]);
    }
    const config = this.tryOnConfigRepo.create(dto);
    return this.tryOnConfigRepo.save(config);
  }

  // ─── Hero Stats ───────────────────────────────────────────────────────────────

  async createHeroStat(dto: CreateHeroStatDto): Promise<HeroStat> {
    const stat = this.heroStatRepo.create(dto);
    return this.heroStatRepo.save(stat);
  }

  async updateHeroStat(id: string, dto: UpdateHeroStatDto): Promise<HeroStat> {
    const stat = await this.heroStatRepo.findOne({ where: { id } });
    if (!stat) throw new NotFoundException('Hero stat not found');
    Object.assign(stat, dto);
    return this.heroStatRepo.save(stat);
  }

  async deleteHeroStat(id: string): Promise<void> {
    const stat = await this.heroStatRepo.findOne({ where: { id } });
    if (!stat) throw new NotFoundException('Hero stat not found');
    await this.heroStatRepo.remove(stat);
  }

  async getHeroStats(): Promise<HeroStat[]> {
    return this.heroStatRepo.find({ order: { displayOrder: 'ASC' } });
  }

  async getActiveHeroStats(): Promise<HeroStat[]> {
    return this.heroStatRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }
}
