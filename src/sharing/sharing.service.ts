import { Injectable } from '@nestjs/common';

@Injectable()
export class SharingService {
  trackShare(itemType: string, itemId: string, platform: string): void {
    console.log(`[Share] ${platform} - ${itemType}:${itemId}`);
  }
}
