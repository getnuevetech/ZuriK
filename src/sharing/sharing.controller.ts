import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { SharingService } from './sharing.service';

class TrackShareDto {
  @IsIn(['product', 'fabric', 'designer'])
  itemType: 'product' | 'fabric' | 'designer';

  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsString()
  @IsNotEmpty()
  platform: string;
}

@ApiTags('shares')
@Controller('shares')
export class SharingController {
  constructor(private readonly sharingService: SharingService) {}

  @Post('track')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Track a share event' })
  track(@Body() body: TrackShareDto): void {
    this.sharingService.trackShare(body.itemType, body.itemId, body.platform);
  }
}
