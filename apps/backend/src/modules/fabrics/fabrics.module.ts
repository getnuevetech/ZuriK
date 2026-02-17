import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FabricsController } from './fabrics.controller';
import { FabricsService } from './fabrics.service';
import { Fabric } from '../../database/entities/fabric.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Fabric, User])],
  controllers: [FabricsController],
  providers: [FabricsService],
  exports: [FabricsService],
})
export class FabricsModule {}
