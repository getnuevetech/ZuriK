import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryHero } from './entities/country-hero.entity';
import { CollectionDisplay } from './entities/collection-display.entity';
import { HomepageLayout } from './entities/homepage-layout.entity';
import { HomepageService } from './homepage.service';
import { HomepageController, AdminHomepageController } from './homepage.controller';
import { ProductsModule } from '../products/products.module';
import { SettingsModule } from '../settings/settings.module';
import { FeaturedModule } from '../featured/featured.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CountryHero, CollectionDisplay, HomepageLayout]),
    ProductsModule,
    SettingsModule,
    FeaturedModule,
  ],
  controllers: [HomepageController, AdminHomepageController],
  providers: [HomepageService],
  exports: [HomepageService],
})
export class HomepageModule {}
