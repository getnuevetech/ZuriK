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
import { ShippingModule } from './shipping/shipping.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UploadModule } from './upload/upload.module';
import { HeroBannersModule } from './hero-banners/hero-banners.module';
import { AdminModule } from './admin/admin.module';
import { ReviewsModule } from './reviews/reviews.module';
import { HomepageModule } from './homepage/homepage.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { SearchModule } from './search/search.module';
import { RecentlyViewedModule } from './recently-viewed/recently-viewed.module';
import { ComparisonsModule } from './comparisons/comparisons.module';
import { SharingModule } from './sharing/sharing.module';
import { WishlistItem } from './wishlist/entities/wishlist-item.entity';
import { RecentlyViewed } from './recently-viewed/entities/recently-viewed.entity';
import { FeaturedSection } from './homepage/entities/featured-section.entity';
import { CountryHero } from './homepage/entities/country-hero.entity';
import { CollectionDisplay } from './homepage/entities/collection-display.entity';
import { ThemeSettings } from './homepage/entities/theme-settings.entity';
import { HomepageLayout } from './homepage/entities/homepage-layout.entity';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Fabric } from './fabrics/entities/fabric.entity';
import { Measurement } from './measurements/entities/measurement.entity';
import { Order } from './orders/entities/order.entity';
import { FabricSellerOrder } from './orders/entities/fabric-seller-order.entity';
import { DesignerOrder } from './orders/entities/designer-order.entity';
import { PlatformSettings } from './settings/entities/platform-settings.entity';
import { TaxConfiguration } from './taxes/entities/tax-configuration.entity';
import { ShippingCarrier } from './shipping/entities/shipping-carrier.entity';
import { PaymentGateway } from './payments/entities/payment-gateway.entity';
import { Payment } from './payments/entities/payment.entity';
import { Payout } from './payments/entities/payout.entity';
import { HeroBanner } from './hero-banners/entities/hero-banner.entity';
import { Notification } from './notifications/entities/notification.entity';
import { Review } from './reviews/entities/review.entity';

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
      entities: [
        User, Product, Fabric, Measurement, Order, FabricSellerOrder, DesignerOrder,
        PlatformSettings, TaxConfiguration, ShippingCarrier, PaymentGateway, Payment, Payout, HeroBanner, Notification, Review,
        FeaturedSection, CountryHero, CollectionDisplay, ThemeSettings, HomepageLayout,
        WishlistItem,
        RecentlyViewed,
      ],
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
    ShippingModule,
    PaymentsModule,
    NotificationsModule,
    CloudinaryModule,
    UploadModule,
    HeroBannersModule,
    AdminModule,
    ReviewsModule,
    HomepageModule,
    WishlistModule,
    SearchModule,
    RecentlyViewedModule,
    ComparisonsModule,
    SharingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

