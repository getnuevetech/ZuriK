import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeaturedSection } from './entities/featured-section.entity';
import { CountryHero } from './entities/country-hero.entity';
import { CollectionDisplay } from './entities/collection-display.entity';
import { ThemeSettings } from './entities/theme-settings.entity';
import { HomepageLayout } from './entities/homepage-layout.entity';
import { PromoBanner } from './entities/promo-banner.entity';
import { CollectionPost } from './entities/collection-post.entity';
import { HeritageStory } from './entities/heritage-story.entity';
import { Design } from '../designs/entities/design.entity';
import { ReadyToWearProduct } from '../ready-to-wear/entities/ready-to-wear-product.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
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
      PromoBanner,
      CollectionPost,
      HeritageStory,
      Design,
      ReadyToWearProduct,
      Order,
      User,
    ]),
  ],
  controllers: [HomepageController],
  providers: [HomepageService],
  exports: [HomepageService],
})
export class HomepageModule {}
