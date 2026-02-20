import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeedService } from './seed.service';
import { Product } from './product.entity';
import { Fabric } from './fabric.entity';
import { Designer } from './designer.entity';
import { User } from './user/user.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

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
      entities: [Product, Fabric, Designer, User],
      synchronize: process.env.AUTO_SYNC === 'true' || !isProduction,
      ssl: isProduction,
      extra: isProduction
        ? { ssl: { rejectUnauthorized: false } }
        : undefined,
    }),
    TypeOrmModule.forFeature([Product, Fabric, Designer]),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}