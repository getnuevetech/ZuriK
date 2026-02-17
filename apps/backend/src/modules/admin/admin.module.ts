import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../../database/entities/user.entity';
import { Order } from '../../database/entities/order.entity';
import { Design } from '../../database/entities/design.entity';
import { Fabric } from '../../database/entities/fabric.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, Design, Fabric])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
