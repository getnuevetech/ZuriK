import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewPrompt } from './entities/review-prompt.entity';
import { ReviewPromptsService } from './review-prompts.service';
import { ReviewPromptsCron } from './review-prompts.cron';
import { ReviewPromptsController } from './review-prompts.controller';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewPrompt, User]),
    NotificationsModule,
  ],
  controllers: [ReviewPromptsController],
  providers: [ReviewPromptsService, ReviewPromptsCron],
  exports: [ReviewPromptsService],
})
export class ReviewPromptsModule {}
