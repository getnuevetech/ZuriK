import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async seedDatabase() {
    this.logger.debug('Starting database seeding...');

    try {
      // Example of seeding data
      this.logger.debug('Seeding data for users...');
      await this.databaseService.seedUsers();
      this.logger.debug('Successfully seeded users.');

      this.logger.debug('Seeding data for products...');
      await this.databaseService.seedProducts();
      this.logger.debug('Successfully seeded products.');

      // Add more seed methods as necessary

      this.logger.debug('Database seeding completed successfully.');
    } catch (error) {
      this.logger.error('Database seeding failed: ', error);
      throw error;
    }
  }
}