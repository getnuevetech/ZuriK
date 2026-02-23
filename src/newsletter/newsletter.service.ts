import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscriber } from './entities/newsletter-subscriber.entity';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(NewsletterSubscriber)
    private subscriberRepo: Repository<NewsletterSubscriber>,
  ) {}

  async subscribe(dto: SubscribeNewsletterDto): Promise<{ message: string }> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existing = await this.subscriberRepo.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await this.subscriberRepo.save(existing);
        return { message: 'Successfully re-subscribed' };
      }
      return { message: 'Already subscribed' };
    }
    const subscriber = this.subscriberRepo.create({
      email: normalizedEmail,
      source: dto.source ?? 'homepage',
    });
    await this.subscriberRepo.save(subscriber);
    return { message: 'Successfully subscribed' };
  }

  async listSubscribers(page = 1, limit = 50): Promise<{ items: NewsletterSubscriber[]; total: number }> {
    const [items, total] = await this.subscriberRepo.findAndCount({
      order: { subscribedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async unsubscribe(email: string): Promise<void> {
    const subscriber = await this.subscriberRepo.findOne({ where: { email } });
    if (subscriber) {
      subscriber.isActive = false;
      await this.subscriberRepo.save(subscriber);
    }
  }
}
