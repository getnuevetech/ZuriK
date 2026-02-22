import { DynamicModule, Logger, Module } from '@nestjs/common';
import { Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({})
export class AuthModule {
  static register(): DynamicModule {
    const providers: Provider[] = [AuthService, JwtStrategy];
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      providers.push(GoogleStrategy);
    } else {
      new Logger('AuthModule').warn(
        'Google OAuth disabled: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured',
      );
    }
    return {
      module: AuthModule,
      imports: [
        TypeOrmModule.forFeature([User]),
        PassportModule.register({ session: false }),
        JwtModule.register({}),
        ConfigModule,
        NotificationsModule,
      ],
      controllers: [AuthController],
      providers,
    };
  }
}
