import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeedService } from './seed.service';
import { Product } from './product.entity';
import { Fabric } from './fabric.entity';
import { Designer } from './designer.entity';

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
      logging: false,
    }),
    TypeOrmModule.forFeature([Product, Fabric, Designer]),
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}
