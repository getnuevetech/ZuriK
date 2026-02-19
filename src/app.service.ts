import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { SeedService } from './seed.service';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    this.logger.log('🚀 AppService.onModuleInit() - Starting database seeding...');
    try {
      await this.seedService.seed();
      this.logger.log('✅ Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('❌ Error during database seeding:', error);
    }
  }

  getHello(): string {
    return 'African Fashion API';
  }
}