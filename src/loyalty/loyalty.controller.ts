import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsInt, Min } from 'class-validator';

class RedeemPointsDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  points: number;
}

@ApiTags('Loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get loyalty points balance' })
  getBalance(@Req() req: any) {
    return this.loyaltyService.getBalance(req.user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get loyalty transaction history' })
  getHistory(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.loyaltyService.getHistory(req.user.id, Number(page), Number(limit));
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Redeem loyalty points' })
  redeem(@Req() req: any, @Body() dto: RedeemPointsDto) {
    return this.loyaltyService.redeemPoints(
      req.user.id,
      dto.points,
      `Redeemed ${dto.points} points for discount`,
    );
  }
}
