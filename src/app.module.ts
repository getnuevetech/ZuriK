import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeedService } from './seed.service';
import { Product } from './product.entity';
import { Fabric } from './fabric.entity';
import { Designer } from './designer.entity';
import { HealthModule } from './health/health.module';

const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Product, Fabric, Designer],
      synchronize: true,
      logging: ['error'],
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      extra: isProduction
        ? {
            ssl: { rejectUnauthorized: false },
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
          }
        : {},
    }),
    TypeOrmModule.forFeature([Product, Fabric, Designer]),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {
  constructor() {
    console.log('🔌 AppModule initialized');
    console.log('📦 Entities: Product, Fabric, Designer');
    console.log('🌱 SeedService should run on startup');
  }
}