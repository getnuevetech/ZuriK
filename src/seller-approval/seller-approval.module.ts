import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerApplication } from './entities/seller-application.entity';
import { SellerApprovalService } from './seller-approval.service';
import { SellerApprovalController } from './seller-approval.controller';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([SellerApplication, User]), NotificationsModule],
  controllers: [SellerApprovalController],
  providers: [SellerApprovalService],
  exports: [SellerApprovalService],
})
export class SellerApprovalModule {}
