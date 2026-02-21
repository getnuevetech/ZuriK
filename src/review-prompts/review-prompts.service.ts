import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewPrompt, ReviewPromptStatus } from './entities/review-prompt.entity';
import { EmailService } from '../notifications/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReviewPromptsService {
  private readonly logger = new Logger(ReviewPromptsService.name);

  constructor(
    @InjectRepository(ReviewPrompt)
    private readonly promptRepo: Repository<ReviewPrompt>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createPrompts(order: any): Promise<void> {
    const productIds: string[] = [];
    if (order.design?.id) productIds.push(order.design.id);
    if (order.fabric?.id) productIds.push(order.fabric.id);

    for (const productId of productIds) {
      const existing = await this.promptRepo.findOne({
        where: { userId: order.customer?.id ?? order.customerId, productId, orderId: order.id },
      });
      if (existing) continue;

      await this.promptRepo.save(
        this.promptRepo.create({
          userId: order.customer?.id ?? order.customerId,
          orderId: order.id,
          productId,
          status: ReviewPromptStatus.PENDING,
        }),
      );
    }
  }

  async sendPromptEmails(): Promise<void> {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const prompts = await this.promptRepo
      .createQueryBuilder('prompt')
      .leftJoinAndSelect('prompt.user', 'user')
      .where('prompt.status = :status', { status: ReviewPromptStatus.PENDING })
      .andWhere('prompt.createdAt < :threeDaysAgo', { threeDaysAgo })
      .getMany();

    for (const prompt of prompts) {
      try {
        await this.emailService.sendReviewRequest(
          prompt.user,
          { id: prompt.productId, name: 'your recent purchase' },
          { orderNumber: prompt.orderId },
        );
        await this.notificationsService.create(
          prompt.userId,
          NotificationType.REVIEW_REQUEST,
          'How was your order?',
          'Share your experience and leave a review.',
          { promptId: prompt.id, productId: prompt.productId },
        );
        prompt.status = ReviewPromptStatus.EMAIL_SENT;
        prompt.emailSentAt = new Date();
        await this.promptRepo.save(prompt);
      } catch (err) {
        this.logger.error(`Failed to send review prompt email ${prompt.id}: ${(err as Error).message}`);
      }
    }
  }

  async markReviewed(userId: string, productId: string): Promise<void> {
    const prompt = await this.promptRepo.findOne({
      where: { userId, productId, status: ReviewPromptStatus.EMAIL_SENT },
    });
    if (!prompt) {
      const pendingPrompt = await this.promptRepo.findOne({
        where: { userId, productId, status: ReviewPromptStatus.PENDING },
      });
      if (!pendingPrompt) return;
      pendingPrompt.status = ReviewPromptStatus.REVIEWED;
      pendingPrompt.reviewedAt = new Date();
      await this.promptRepo.save(pendingPrompt);
      return;
    }
    prompt.status = ReviewPromptStatus.REVIEWED;
    prompt.reviewedAt = new Date();
    await this.promptRepo.save(prompt);
  }

  async dismissPrompt(promptId: string, userId: string): Promise<void> {
    const prompt = await this.promptRepo.findOne({ where: { id: promptId } });
    if (!prompt) throw new NotFoundException(`Prompt ${promptId} not found`);
    if (prompt.userId !== userId) throw new ForbiddenException('Access denied');
    prompt.status = ReviewPromptStatus.DISMISSED;
    await this.promptRepo.save(prompt);
  }

  async getMyPrompts(userId: string): Promise<ReviewPrompt[]> {
    return this.promptRepo.find({
      where: [
        { userId, status: ReviewPromptStatus.PENDING },
        { userId, status: ReviewPromptStatus.EMAIL_SENT },
      ],
      order: { createdAt: 'DESC' },
    });
  }
}
