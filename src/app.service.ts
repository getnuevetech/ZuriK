import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(private readonly databaseService: DatabaseService) {}

  async onApplicationBootstrap() {
    console.log('Application is bootstrapping, starting database seed.');
    try {
      await this.databaseService.seedDatabase();
      console.log('Database seeding completed successfully.');
    } catch (error) {
      console.error('Error during database seeding:', error);
    }
  }
}