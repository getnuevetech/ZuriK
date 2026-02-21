import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewPromptsService } from './review-prompts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Review Prompts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('review-prompts')
export class ReviewPromptsController {
  constructor(private readonly reviewPromptsService: ReviewPromptsService) {}

  @Get()
  @ApiOperation({ summary: 'Get my pending review prompts' })
  getMyPrompts(@Req() req: any) {
    return this.reviewPromptsService.getMyPrompts(req.user.id);
  }

  @Patch(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss a review prompt' })
  dismiss(@Param('id') id: string, @Req() req: any) {
    return this.reviewPromptsService.dismissPrompt(id, req.user.id);
  }
}
