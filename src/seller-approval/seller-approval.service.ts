import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SellerApplication,
  SellerApplicationStatus,
  RequestedRole,
} from './entities/seller-application.entity';
import { CreateSellerApplicationDto } from './dto/create-seller-application.dto';
import { ReviewSellerApplicationDto } from './dto/review-seller-application.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class SellerApprovalService {
  constructor(
    @InjectRepository(SellerApplication)
    private readonly applicationRepo: Repository<SellerApplication>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async apply(userId: string, dto: CreateSellerApplicationDto): Promise<SellerApplication> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Only customers can apply to become sellers');
    }

    const existing = await this.applicationRepo.findOne({
      where: { applicantId: userId, status: SellerApplicationStatus.PENDING },
    });
    if (existing) {
      throw new BadRequestException('You already have a pending application');
    }

    const application = this.applicationRepo.create({
      applicantId: userId,
      requestedRole: dto.requestedRole as unknown as RequestedRole,
      businessName: dto.businessName,
      businessDescription: dto.businessDescription,
      portfolioUrl: dto.portfolioUrl,
      experience: dto.experience,
    });
    const saved = await this.applicationRepo.save(application);

    // Notify admins
    const admins = await this.userRepo.find({ where: { role: UserRole.ADMIN, isActive: true } });
    for (const admin of admins) {
      this.notificationsService
        .create(
          admin.id,
          NotificationType.NEW_ORDER,
          'New Seller Application',
          `${user.firstName || user.email} applied to become a ${dto.requestedRole}.`,
          { applicationId: saved.id },
        )
        .catch(() => undefined);
    }

    return saved;
  }

  async getMyApplications(userId: string): Promise<SellerApplication[]> {
    return this.applicationRepo.find({
      where: { applicantId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllApplications(status?: SellerApplicationStatus): Promise<SellerApplication[]> {
    const where = status ? { status } : {};
    return this.applicationRepo.find({
      where,
      relations: ['applicant'],
      order: { createdAt: 'DESC' },
    });
  }

  async getApplicationById(id: string): Promise<SellerApplication> {
    const application = await this.applicationRepo.findOne({
      where: { id },
      relations: ['applicant', 'reviewedBy'],
    });
    if (!application) throw new NotFoundException(`Application ${id} not found`);
    return application;
  }

  async reviewApplication(
    applicationId: string,
    adminId: string,
    dto: ReviewSellerApplicationDto,
  ): Promise<SellerApplication> {
    const application = await this.applicationRepo.findOne({
      where: { id: applicationId },
      relations: ['applicant'],
    });
    if (!application) throw new NotFoundException(`Application ${applicationId} not found`);
    if (application.status !== SellerApplicationStatus.PENDING) {
      throw new BadRequestException('Application has already been reviewed');
    }

    application.status = dto.status;
    if (dto.adminNotes !== undefined) {
      application.adminNotes = dto.adminNotes;
    }
    application.reviewedById = adminId;
    application.reviewedAt = new Date();

    if (dto.status === SellerApplicationStatus.APPROVED) {
      const roleMap: Record<RequestedRole, UserRole> = {
        [RequestedRole.DESIGNER]: UserRole.DESIGNER,
        [RequestedRole.FABRIC_SELLER]: UserRole.FABRIC_SELLER,
      };
      await this.userRepo.update(application.applicantId, { role: roleMap[application.requestedRole] });
    }

    const saved = await this.applicationRepo.save(application);

    // Notify applicant
    const messageText =
      dto.status === SellerApplicationStatus.APPROVED
        ? `Congratulations! Your seller application has been approved.`
        : `Your seller application has been rejected.${dto.adminNotes ? ` Reason: ${dto.adminNotes}` : ''}`;

    this.notificationsService
      .create(
        application.applicantId,
        NotificationType.ORDER_STATUS_CHANGE,
        dto.status === SellerApplicationStatus.APPROVED ? 'Application Approved' : 'Application Rejected',
        messageText,
        { applicationId: saved.id },
      )
      .catch(() => undefined);

    return saved;
  }
}
