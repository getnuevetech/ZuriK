import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeaturedSection } from './entities/featured-section.entity';
import { FeaturedService } from './featured.service';
import { HomepageFeaturedController, AdminFeaturedController } from './featured.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([FeaturedSection]), ProductsModule],
  controllers: [HomepageFeaturedController, AdminFeaturedController],
  providers: [FeaturedService],
  exports: [FeaturedService],
})
export class FeaturedModule {}
