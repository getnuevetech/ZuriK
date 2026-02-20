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
import { SettingsModule } from './settings/settings.module';
import { TaxesModule } from './taxes/taxes.module';
import { PaymentsModule } from './payments/payments.module';
import { ShippingModule } from './shipping/shipping.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UploadModule } from './upload/upload.module';
import { User } from './user/user.entity';
import { Product } from './products/entities/product.entity';
import { Fabric } from './fabrics/entities/fabric.entity';
import { Measurement } from './measurements/entities/measurement.entity';
import { Order } from './orders/entities/order.entity';
import { PlatformSettings } from './settings/entities/platform-settings.entity';
import { TaxConfiguration } from './taxes/entities/tax-configuration.entity';
import { PaymentGateway } from './payments/entities/payment-gateway.entity';
import { ShippingCarrier } from './shipping/entities/shipping-carrier.entity';

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
      entities: [User, Product, Fabric, Measurement, Order, PlatformSettings, TaxConfiguration, PaymentGateway, ShippingCarrier],
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
    SettingsModule,
    TaxesModule,
    PaymentsModule,
    ShippingModule,
    NotificationsModule,
    CloudinaryModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
