import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

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
    const tokens = await this.generateTokens(user);
    const { password: _pw, refreshToken: _rt, ...userWithoutSecrets } = user;
    return { user: userWithoutSecrets, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.password) {
      throw new UnauthorizedException(
        'This account uses Google sign-in. Please use the "Continue with Google" button.',
      );
    }
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
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
