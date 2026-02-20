import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { HomepageService } from './homepage.service';
import { SettingsService } from '../settings/settings.service';
import { FeaturedService } from '../featured/featured.service';
import { CreateCountryHeroDto } from './dto/create-country-hero.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { LayoutSection } from './entities/homepage-layout.entity';
import { HeroImage } from './entities/country-hero.entity';

// ---- Public Homepage Endpoints ----

@ApiTags('Homepage')
@Controller('homepage')
export class HomepageController {
  constructor(
    private readonly homepageService: HomepageService,
    private readonly settingsService: SettingsService,
    private readonly featuredService: FeaturedService,
  ) {}

  @Get()
  async getHomepageData() {
    const [layout, theme, featured, countries, collections] = await Promise.all([
      this.homepageService.getHomepageLayout(),
      this.settingsService.getThemeSettings(),
      this.featuredService.getHomepageFeatured(),
      this.homepageService.getCountryHeroes(),
      this.homepageService.getCollections(),
    ]);
    return { layout: layout.sections, theme, featured, countries, collections };
  }

  @Get('layout')
  getLayout() {
    return this.homepageService.getHomepageLayout();
  }

  @Get('countries')
  getCountryHeroes() {
    return this.homepageService.getCountryHeroes();
  }

  @Get('collections')
  getCollections() {
    return this.homepageService.getCollections();
  }
}

// ---- Admin Homepage Endpoints ----

@ApiTags('Admin Homepage')
@ApiBearerAuth()
@Controller('admin/homepage')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminHomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Patch('layout')
  updateLayout(@Body('sections') sections: LayoutSection[]) {
    return this.homepageService.updateHomepageLayout(sections);
  }

  // Country Heroes
  @Get('countries')
  getAllCountryHeroes() {
    return this.homepageService.getAllCountryHeroes();
  }

  @Post('countries')
  createCountryHero(@Body() dto: CreateCountryHeroDto) {
    return this.homepageService.createCountryHero(dto);
  }

  @Patch('countries/:id')
  updateCountryHero(@Param('id') id: string, @Body() dto: Partial<CreateCountryHeroDto>) {
    return this.homepageService.updateCountryHero(id, dto);
  }

  @Delete('countries/:id')
  deleteCountryHero(@Param('id') id: string) {
    return this.homepageService.deleteCountryHero(id);
  }

  @Post('countries/:id/images')
  addHeroImage(@Param('id') id: string, @Body() imageData: HeroImage) {
    return this.homepageService.addHeroImage(id, imageData);
  }

  @Delete('countries/:id/images/:index')
  removeHeroImage(@Param('id') id: string, @Param('index', ParseIntPipe) index: number) {
    return this.homepageService.removeHeroImage(id, index);
  }

  @Post('countries/reorder')
  reorderCountries(@Body('orderedIds') orderedIds: string[]) {
    return this.homepageService.reorderCountries(orderedIds);
  }

  // Collections
  @Get('collections')
  getAllCollections() {
    return this.homepageService.getAllCollections();
  }

  @Post('collections')
  createCollection(@Body() dto: CreateCollectionDto) {
    return this.homepageService.createCollection(dto);
  }

  @Patch('collections/:id')
  updateCollection(@Param('id') id: string, @Body() dto: Partial<CreateCollectionDto>) {
    return this.homepageService.updateCollection(id, dto);
  }

  @Delete('collections/:id')
  deleteCollection(@Param('id') id: string) {
    return this.homepageService.deleteCollection(id);
  }

  @Post('collections/reorder')
  reorderCollections(@Body('orderedIds') orderedIds: string[]) {
    return this.homepageService.reorderCollections(orderedIds);
  }
}
