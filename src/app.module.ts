import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { FabricsModule } from './fabrics/fabrics.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { OrdersModule } from './orders/orders.module';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Fabric } from './fabrics/entities/fabric.entity';
import { Measurement } from './measurements/entities/measurement.entity';
import { Order } from './orders/entities/order.entity';
import { FabricSellerOrder } from './orders/entities/fabric-seller-order.entity';
import { DesignerOrder } from './orders/entities/designer-order.entity';

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
      entities: [User, Product, Fabric, Measurement, Order, FabricSellerOrder, DesignerOrder],
      synchronize: process.env.AUTO_SYNC === 'true' || !isProduction,
      ssl: isProduction,
      extra: isProduction
        ? { ssl: { rejectUnauthorized: false } }
        : undefined,
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    FabricsModule,
    MeasurementsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

