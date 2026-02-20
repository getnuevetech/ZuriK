import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeroBanner } from './entities/hero-banner.entity';
import { HeroBannersService } from './hero-banners.service';
import { HeroBannersController } from './hero-banners.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HeroBanner])],
  controllers: [HeroBannersController],
  providers: [HeroBannersService],
  exports: [HeroBannersService],
})
export class HeroBannersModule {}
