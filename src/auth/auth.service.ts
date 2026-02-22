import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../notifications/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {
    if (!this.configService.get('JWT_ACCESS_SECRET') || !this.configService.get('JWT_REFRESH_SECRET')) {
      this.logger.warn('JWT_ACCESS_SECRET and/or JWT_REFRESH_SECRET not set. Falling back to JWT_SECRET. For production, set separate secrets.');
    }
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const password = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role || UserRole.CUSTOMER,
    });
    await this.userRepo.save(user);

    // Send email verification
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + 86400000); // 24 hours
    await this.userRepo.save(user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
    try {
      await this.emailService.sendEmailVerification(user, verifyUrl);
    } catch (emailErr) {
      this.logger.error(`Failed to send verification email to ${user.email}: ${(emailErr as Error).message}`);
    }

    const tokens = await this.generateTokens(user);
    const { password: _pw, refreshToken: _rt, ...userWithoutSecrets } = user;
    return { user: userWithoutSecrets, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(
        `Account is temporarily locked due to too many failed login attempts. Please try again in ${minutesLeft} minute(s) or reset your password.`,
      );
    }

    // If lock has expired, reset counters
    if (user.lockedUntil && user.lockedUntil <= new Date()) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await this.userRepo.save(user);
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'This account uses Google sign-in. Please use the "Continue with Google" button.',
      );
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await this.userRepo.save(user);
        await this.emailService.sendAccountLockout(user);
        throw new UnauthorizedException(
          'Account has been temporarily locked due to too many failed login attempts. Please try again in 15 minutes or reset your password.',
        );
      }

      await this.userRepo.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await this.userRepo.save(user);
    }

    const tokens = await this.generateTokens(user);
    const { password: _pw, refreshToken: _rt, ...userWithoutSecrets } = user;
    return { user: userWithoutSecrets, ...tokens };
  }

  async googleLogin(googleUser: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  }) {
    let user = await this.userRepo.findOne({ where: { googleId: googleUser.googleId } });

    if (!user) {
      user = await this.userRepo.findOne({ where: { email: googleUser.email } });

      if (user) {
        user.googleId = googleUser.googleId;
        if (!user.avatarUrl && googleUser.avatarUrl) {
          user.avatarUrl = googleUser.avatarUrl;
        }
        await this.userRepo.save(user);
      } else {
        user = this.userRepo.create({
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          googleId: googleUser.googleId,
          avatarUrl: googleUser.avatarUrl || undefined,
          provider: 'google',
          role: UserRole.CUSTOMER,
          isActive: true,
          isEmailVerified: true,
        });
        await this.userRepo.save(user);
      }
    }

    const tokens = await this.generateTokens(user);
    const { password: _pw, refreshToken: _rt, ...userWithoutSecrets } = user;
    return { user: userWithoutSecrets, ...tokens };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; email: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const tokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.generateTokens(user);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) return { message: 'If an account exists with this email, a reset link has been sent.' };

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    await this.userRepo.save(user);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    await this.emailService.sendPasswordReset(user, resetUrl);

    return { message: 'If an account exists with this email, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userRepo.findOne({
      where: { passwordResetToken: hashedToken },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await this.userRepo.save(user);

    return { message: 'Password has been reset successfully. You can now log in.' };
  }

  async sendVerificationEmail(userId: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isEmailVerified) return { message: 'Email is already verified' };

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + 86400000); // 24 hours
    await this.userRepo.save(user);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
    await this.emailService.sendEmailVerification(user, verifyUrl);

    return { message: 'Verification email sent' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userRepo.findOne({
      where: { emailVerificationToken: hashedToken },
    });

    if (!user || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await this.userRepo.save(user);

    return { message: 'Email verified successfully' };
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const secret = this.configService.get<string>('JWT_ACCESS_SECRET') || this.configService.get<string>('JWT_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET or JWT_ACCESS_SECRET must be configured');
    if (!refreshSecret) throw new Error('JWT_SECRET or JWT_REFRESH_SECRET must be configured');
    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(user.id, { refreshToken: refreshTokenHash });
    return { accessToken, refreshToken };
  }
}
