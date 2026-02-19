import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      country: dto.country,
      role: dto.role || UserRole.CUSTOMER,
    });
    const saved = await this.userRepository.save(user);
    const tokens = await this.generateTokens(saved);
    await this.storeRefreshToken(saved.id, tokens.refreshToken);
    return { user: this.sanitizeUser(saved), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }
    const tokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenMatch) {
      throw new UnauthorizedException('Access denied');
    }
    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.userRepository.update(userId, { refreshToken: null });
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'access-secret',
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string) {
    const hashed = await bcrypt.hash(token, 10);
    await this.userRepository.update(userId, { refreshToken: hashed });
  }

  private sanitizeUser(user: User) {
    const { passwordHash, refreshToken, ...safe } = user;
    return safe;
  }
}
