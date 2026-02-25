import {
  Controller, Get, Post, Patch, Put, Delete, Param, Body, UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { HomepageService } from './homepage.service';
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
import { UpdateShopByCountrySettingsDto } from './dto/update-shop-by-country-settings.dto';

@ApiTags('homepage')
@Controller('homepage')
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  // ─── Public Endpoints ─────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get full homepage configuration (public)' })
  async getHomepage() {
    const [themeSettings, featuredData, countries, collectionsData, layout] = await Promise.all([
      this.homepageService.getThemeSettings(),
      this.homepageService.getFeaturedProductsForHomepage(),
      this.homepageService.getActiveCountryHeroes(),
      this.homepageService.getActiveCollections(),
      this.homepageService.getHomepageLayout(),
    ]);
    const colors = await this.homepageService.getThemeColors();

    return {
      theme: { activeTheme: themeSettings.activeTheme, colors },
      layout: layout
        .filter((l) => l.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((l) => ({ type: l.sectionType, order: l.displayOrder, sectionId: l.sectionId })),
      featuredSections: featuredData,
      countries,
      collections: collectionsData,
    };
  }

  @Get('theme')
  @ApiOperation({ summary: 'Get current theme colors (public)' })
  async getTheme() {
    const themeSettings = await this.homepageService.getThemeSettings();
    const colors = await this.homepageService.getThemeColors();
    return { activeTheme: themeSettings.activeTheme, colors };
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get active featured product sections (public)' })
  getFeatured() {
    return this.homepageService.getFeaturedProductsForHomepage();
  }

  @Get('countries')
  @ApiOperation({ summary: 'Get active country categories (public)' })
  getCountries() {
    return this.homepageService.getActiveCountryHeroes();
  }

  @Get('collections')
  @ApiOperation({ summary: 'Get active collections (public)' })
  getCollections() {
    return this.homepageService.getActiveCollections();
  }

  // ─── Admin Endpoints — Featured Sections ─────────────────────────────────────

  @Get('admin/featured')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all featured sections (admin)' })
  adminGetFeatured() {
    return this.homepageService.getFeaturedSections();
  }

  @Post('admin/featured')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create featured section (admin)' })
  adminCreateFeatured(@Body() dto: CreateFeaturedSectionDto) {
    return this.homepageService.createFeaturedSection(dto);
  }

  @Patch('admin/featured/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update featured section (admin)' })
  adminUpdateFeatured(@Param('id') id: string, @Body() dto: UpdateFeaturedSectionDto) {
    return this.homepageService.updateFeaturedSection(id, dto);
  }

  @Delete('admin/featured/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete featured section (admin)' })
  adminDeleteFeatured(@Param('id') id: string) {
    return this.homepageService.deleteFeaturedSection(id);
  }

  // ─── Admin Endpoints — Country Heroes ────────────────────────────────────────

  @Get('admin/countries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all country heroes (admin)' })
  adminGetCountries() {
    return this.homepageService.getCountryHeroes();
  }

  @Post('admin/countries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create country hero (admin)' })
  adminCreateCountry(@Body() dto: CreateCountryHeroDto) {
    return this.homepageService.createCountryHero(dto);
  }

  @Patch('admin/countries/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update country hero (admin)' })
  adminUpdateCountry(@Param('id') id: string, @Body() dto: UpdateCountryHeroDto) {
    return this.homepageService.updateCountryHero(id, dto);
  }

  @Delete('admin/countries/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete country hero (admin)' })
  adminDeleteCountry(@Param('id') id: string) {
    return this.homepageService.deleteCountryHero(id);
  }

  // ─── Admin Endpoints — Collections ───────────────────────────────────────────

  @Get('admin/collections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all collection displays (admin)' })
  adminGetCollections() {
    return this.homepageService.getCollectionDisplays();
  }

  @Post('admin/collections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create collection display (admin)' })
  adminCreateCollection(@Body() dto: CreateCollectionDisplayDto) {
    return this.homepageService.createCollectionDisplay(dto);
  }

  @Patch('admin/collections/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update collection display (admin)' })
  adminUpdateCollection(@Param('id') id: string, @Body() dto: UpdateCollectionDisplayDto) {
    return this.homepageService.updateCollectionDisplay(id, dto);
  }

  @Delete('admin/collections/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete collection display (admin)' })
  adminDeleteCollection(@Param('id') id: string) {
    return this.homepageService.deleteCollectionDisplay(id);
  }

  // ─── Admin Endpoints — Theme ──────────────────────────────────────────────────

  @Get('admin/theme')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get theme settings (admin)' })
  adminGetTheme() {
    return this.homepageService.getThemeSettings();
  }

  @Patch('admin/theme')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update theme settings (admin)' })
  adminUpdateTheme(@Body() dto: UpdateThemeDto) {
    return this.homepageService.updateThemeSettings(dto);
  }

  @Get('admin/theme/presets')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all theme presets (admin)' })
  adminGetThemePresets() {
    return this.homepageService.getThemePresets();
  }

  // ─── Admin Endpoints — Layout ─────────────────────────────────────────────────

  @Get('admin/layout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get homepage layout (admin)' })
  adminGetLayout() {
    return this.homepageService.getHomepageLayout();
  }

  @Put('admin/layout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update homepage layout order (admin)' })
  adminUpdateLayout(@Body() dto: UpdateHomepageLayoutDto) {
    return this.homepageService.updateHomepageLayout(dto);
  }

  // ─── Public Endpoints — Promo Banners ────────────────────────────────────────

  @Get('promo-banners')
  @ApiOperation({ summary: 'Get active promo banners (public)' })
  getPromoBanners() {
    return this.homepageService.getActivePromoBanners();
  }

  @Get('promo-banners/by-location')
  @ApiOperation({ summary: 'Get active promo banners grouped by location (public)' })
  getPromoBannersByLocation() {
    return this.homepageService.getActivePromoBannersByLocation();
  }

  @Get('shop-by-country')
  @ApiOperation({ summary: 'Get shop by country data (public)' })
  getShopByCountry() {
    return this.homepageService.getShopByCountryData();
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending products sorted by purchase count (public)' })
  getTrending(@Query('limit') limit?: string) {
    return this.homepageService.getTrendingProducts(limit ? Number(limit) : 10);
  }

  @Get('collection-posts')
  @ApiOperation({ summary: 'Get active collection posts (public)' })
  getCollectionPosts() {
    return this.homepageService.getActiveCollectionPosts();
  }

  @Get('heritage-stories')
  @ApiOperation({ summary: 'Get active heritage stories (public)' })
  getHeritageStories() {
    return this.homepageService.getActiveHeritageStories();
  }

  // ─── Admin Endpoints — Promo Banners ─────────────────────────────────────────

  @Get('admin/promo-banners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all promo banners (admin)' })
  adminGetPromoBanners() {
    return this.homepageService.getPromoBanners();
  }

  @Post('admin/promo-banners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create promo banner (admin)' })
  adminCreatePromoBanner(@Body() dto: CreatePromoBannerDto) {
    return this.homepageService.createPromoBanner(dto);
  }

  @Patch('admin/promo-banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update promo banner (admin)' })
  adminUpdatePromoBanner(@Param('id') id: string, @Body() dto: UpdatePromoBannerDto) {
    return this.homepageService.updatePromoBanner(id, dto);
  }

  @Delete('admin/promo-banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete promo banner (admin)' })
  adminDeletePromoBanner(@Param('id') id: string) {
    return this.homepageService.deletePromoBanner(id);
  }

  // ─── Admin Endpoints — Collection Posts ──────────────────────────────────────

  @Get('admin/collection-posts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all collection posts (admin)' })
  adminGetCollectionPosts() {
    return this.homepageService.getCollectionPosts();
  }

  @Post('admin/collection-posts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create collection post (admin)' })
  adminCreateCollectionPost(@Body() dto: CreateCollectionPostDto) {
    return this.homepageService.createCollectionPost(dto);
  }

  @Patch('admin/collection-posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update collection post (admin)' })
  adminUpdateCollectionPost(@Param('id') id: string, @Body() dto: UpdateCollectionPostDto) {
    return this.homepageService.updateCollectionPost(id, dto);
  }

  @Delete('admin/collection-posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete collection post (admin)' })
  adminDeleteCollectionPost(@Param('id') id: string) {
    return this.homepageService.deleteCollectionPost(id);
  }

  // ─── Admin Endpoints — Heritage Stories ──────────────────────────────────────

  @Get('admin/heritage-stories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all heritage stories (admin)' })
  adminGetHeritageStories() {
    return this.homepageService.getHeritageStories();
  }

  @Post('admin/heritage-stories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create heritage story (admin)' })
  adminCreateHeritageStory(@Body() dto: CreateHeritageStoryDto) {
    return this.homepageService.createHeritageStory(dto);
  }

  @Patch('admin/heritage-stories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update heritage story (admin)' })
  adminUpdateHeritageStory(@Param('id') id: string, @Body() dto: UpdateHeritageStoryDto) {
    return this.homepageService.updateHeritageStory(id, dto);
  }

  @Delete('admin/heritage-stories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete heritage story (admin)' })
  adminDeleteHeritageStory(@Param('id') id: string) {
    return this.homepageService.deleteHeritageStory(id);
  }

  // ─── Public Endpoints — How It Works ─────────────────────────────────────────

  @Get('how-it-works')
  @ApiOperation({ summary: 'Get active How It Works steps (public)' })
  getHowItWorksSteps() {
    return this.homepageService.getActiveHowItWorksSteps();
  }

  // ─── Admin Endpoints — How It Works ──────────────────────────────────────────

  @Get('admin/how-it-works')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all How It Works steps (admin)' })
  adminGetHowItWorksSteps() {
    return this.homepageService.getHowItWorksSteps();
  }

  @Post('admin/how-it-works')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create How It Works step (admin)' })
  adminCreateHowItWorksStep(@Body() dto: CreateHowItWorksStepDto) {
    return this.homepageService.createHowItWorksStep(dto);
  }

  @Patch('admin/how-it-works/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update How It Works step (admin)' })
  adminUpdateHowItWorksStep(@Param('id') id: string, @Body() dto: UpdateHowItWorksStepDto) {
    return this.homepageService.updateHowItWorksStep(id, dto);
  }

  @Delete('admin/how-it-works/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete How It Works step (admin)' })
  adminDeleteHowItWorksStep(@Param('id') id: string) {
    return this.homepageService.deleteHowItWorksStep(id);
  }

  // ─── Public Endpoints — TryOn Config ─────────────────────────────────────────

  @Get('tryon-config')
  @ApiOperation({ summary: 'Get TryOn integration config (public, hides apiKey)' })
  async getTryOnConfig() {
    const config = await this.homepageService.getTryOnConfig();
    return config
      ? {
          isEnabled: config.isEnabled,
          hasConfig: !!(config.apiEndpoint && config.apiKey),
          providerName: config.providerName ?? null,
          showcaseImages: config.showcaseImages ?? [],
        }
      : { isEnabled: false, hasConfig: false, providerName: null, showcaseImages: [] };
  }

  // ─── Admin Endpoints — TryOn Config ──────────────────────────────────────────

  @Get('admin/tryon-config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get TryOn config (admin)' })
  adminGetTryOnConfig() {
    return this.homepageService.getTryOnConfig();
  }

  @Patch('admin/tryon-config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update TryOn config (admin)' })
  adminUpdateTryOnConfig(@Body() dto: UpdateTryOnConfigDto) {
    return this.homepageService.upsertTryOnConfig(dto);
  }

  // ─── Public Endpoints — Hero Stats ──────────────────────────────────────────

  @Get('hero-stats')
  @ApiOperation({ summary: 'Get active hero stats (public)' })
  getHeroStats() {
    return this.homepageService.getActiveHeroStats();
  }

  // ─── Admin Endpoints — Hero Stats ───────────────────────────────────────────

  @Get('admin/hero-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all hero stats (admin)' })
  adminGetHeroStats() {
    return this.homepageService.getHeroStats();
  }

  @Post('admin/hero-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create hero stat (admin)' })
  adminCreateHeroStat(@Body() dto: CreateHeroStatDto) {
    return this.homepageService.createHeroStat(dto);
  }

  @Patch('admin/hero-stats/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update hero stat (admin)' })
  adminUpdateHeroStat(@Param('id') id: string, @Body() dto: UpdateHeroStatDto) {
    return this.homepageService.updateHeroStat(id, dto);
  }

  @Delete('admin/hero-stats/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete hero stat (admin)' })
  adminDeleteHeroStat(@Param('id') id: string) {
    return this.homepageService.deleteHeroStat(id);
  }

  // ─── Public Endpoints — Shop By Country Settings ──────────────────────────────

  @Get('shop-by-country-settings')
  @ApiOperation({ summary: 'Get Shop By Country section settings (public)' })
  getShopByCountrySettings() {
    return this.homepageService.getShopByCountrySettings();
  }

  // ─── Admin Endpoints — Shop By Country Settings ───────────────────────────────

  @Get('admin/shop-by-country-settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Shop By Country settings (admin)' })
  adminGetShopByCountrySettings() {
    return this.homepageService.getShopByCountrySettings();
  }

  @Patch('admin/shop-by-country-settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Shop By Country settings (admin)' })
  adminUpdateShopByCountrySettings(@Body() dto: UpdateShopByCountrySettingsDto) {
    return this.homepageService.updateShopByCountrySettings(dto);
  }
}
