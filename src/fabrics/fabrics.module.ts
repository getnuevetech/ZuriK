import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fabric } from './entities/fabric.entity';
import { FabricsService } from './fabrics.service';
import { FabricsController } from './fabrics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Fabric])],
  controllers: [FabricsController],
  providers: [FabricsService],
  exports: [FabricsService, TypeOrmModule],
})
export class FabricsModule {}
