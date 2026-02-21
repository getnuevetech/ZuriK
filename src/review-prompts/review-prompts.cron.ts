import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReviewPromptsService } from './review-prompts.service';

@Injectable()
export class ReviewPromptsCron {
  constructor(private readonly reviewPromptsService: ReviewPromptsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendPrompts(): Promise<void> {
    await this.reviewPromptsService.sendPromptEmails();
  }
}
