import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecentlyViewed } from './entities/recently-viewed.entity';
import { RecentlyViewedService } from './recently-viewed.service';
import { RecentlyViewedController } from './recently-viewed.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RecentlyViewed])],
  controllers: [RecentlyViewedController],
  providers: [RecentlyViewedService],
  exports: [RecentlyViewedService],
})
export class RecentlyViewedModule {}
