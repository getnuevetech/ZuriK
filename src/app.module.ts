import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DesignsModule } from './designs/designs.module';
import { ReadyToWearModule } from './ready-to-wear/ready-to-wear.module';
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
import { CouponsModule } from './coupons/coupons.module';
import { SellerApprovalModule } from './seller-approval/seller-approval.module';
import { CartModule } from './cart/cart.module';
import { AddressesModule } from './addresses/addresses.module';
import { AbandonedCartModule } from './abandoned-cart/abandoned-cart.module';
import { ReviewPromptsModule } from './review-prompts/review-prompts.module';
import { StockAlertsModule } from './stock-alerts/stock-alerts.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { Coupon } from './coupons/entities/coupon.entity';
import { CouponUsage } from './coupons/entities/coupon-usage.entity';
import { WishlistItem } from './wishlist/entities/wishlist-item.entity';
import { RecentlyViewed } from './recently-viewed/entities/recently-viewed.entity';
import { FeaturedSection } from './homepage/entities/featured-section.entity';
import { CountryHero } from './homepage/entities/country-hero.entity';
import { CollectionDisplay } from './homepage/entities/collection-display.entity';
import { ThemeSettings } from './homepage/entities/theme-settings.entity';
import { HomepageLayout } from './homepage/entities/homepage-layout.entity';
import { User } from './users/entities/user.entity';
import { Design } from './designs/entities/design.entity';
import { ReadyToWearProduct } from './ready-to-wear/entities/ready-to-wear-product.entity';
import { Fabric } from './fabrics/entities/fabric.entity';
import { Measurement } from './measurements/entities/measurement.entity';
import { Order } from './orders/entities/order.entity';
import { FabricSellerOrder } from './orders/entities/fabric-seller-order.entity';
import { DesignerOrder } from './orders/entities/designer-order.entity';
import { PlatformSettings } from './settings/entities/platform-settings.entity';
import { TaxConfiguration } from './taxes/entities/tax-configuration.entity';
import { ShippingCarrier } from './shipping/entities/shipping-carrier.entity';
import { ShippingMethod } from './shipping/entities/shipping-method.entity';
import { ShipmentTracking } from './shipping/entities/shipment-tracking.entity';
import { TrackingEvent } from './shipping/entities/tracking-event.entity';
import { PaymentGateway } from './payments/entities/payment-gateway.entity';
import { Payment } from './payments/entities/payment.entity';
import { Payout } from './payments/entities/payout.entity';
import { HeroBanner } from './hero-banners/entities/hero-banner.entity';
import { Notification } from './notifications/entities/notification.entity';
import { Review } from './reviews/entities/review.entity';
import { SellerApplication } from './seller-approval/entities/seller-application.entity';
import { CartItem } from './cart/entities/cart-item.entity';
import { Address } from './addresses/entities/address.entity';
import { AbandonedCart } from './abandoned-cart/entities/abandoned-cart.entity';
import { ReviewPrompt } from './review-prompts/entities/review-prompt.entity';
import { StockAlert } from './stock-alerts/entities/stock-alert.entity';
import { LoyaltyTransaction } from './loyalty/entities/loyalty-transaction.entity';

const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        User, Design, ReadyToWearProduct, Fabric, Measurement, Order, FabricSellerOrder, DesignerOrder,
        PlatformSettings, TaxConfiguration, ShippingCarrier, ShippingMethod, ShipmentTracking, TrackingEvent, PaymentGateway, Payment, Payout, HeroBanner, Notification, Review,
        FeaturedSection, CountryHero, CollectionDisplay, ThemeSettings, HomepageLayout,
        WishlistItem,
        RecentlyViewed,
        Coupon,
        CouponUsage,
        SellerApplication,
        CartItem,
        Address,
        AbandonedCart,
        ReviewPrompt,
        StockAlert,
        LoyaltyTransaction,
      ],
      synchronize: !isProduction,
      ssl: isProduction,
      extra: isProduction
        ? {
            ssl: {
              rejectUnauthorized: true,
              ...(process.env.DATABASE_CA_CERT
                ? { ca: process.env.DATABASE_CA_CERT }
                : {}),
            },
          }
        : undefined,
    }),
    AuthModule.register(),
    UsersModule,
    DesignsModule,
    ReadyToWearModule,
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
    CouponsModule,
    SellerApprovalModule,
    CartModule,
    AddressesModule,
    AbandonedCartModule,
    ReviewPromptsModule,
    StockAlertsModule,
    LoyaltyModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
