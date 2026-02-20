import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeaturedSection } from './entities/featured-section.entity';
import { CountryHero } from './entities/country-hero.entity';
import { CollectionDisplay } from './entities/collection-display.entity';
import { ThemeSettings } from './entities/theme-settings.entity';
import { HomepageLayout } from './entities/homepage-layout.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { HomepageService } from './homepage.service';
import { HomepageController } from './homepage.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeaturedSection,
      CountryHero,
      CollectionDisplay,
      ThemeSettings,
      HomepageLayout,
      Product,
      Order,
    ]),
  ],
  controllers: [HomepageController],
  providers: [HomepageService],
  exports: [HomepageService],
})
export class HomepageModule {}
