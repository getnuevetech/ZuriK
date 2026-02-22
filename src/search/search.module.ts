import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Design } from '../designs/entities/design.entity';
import { ReadyToWearProduct } from '../ready-to-wear/entities/ready-to-wear-product.entity';
import { Fabric } from '../fabrics/entities/fabric.entity';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Design, ReadyToWearProduct, Fabric])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
