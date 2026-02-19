import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as https from 'https';
import { User, UserRole, AuthProvider } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleProfile } from './strategies/google.strategy';

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
      authProvider: AuthProvider.EMAIL,
    });
    const saved = await this.userRepository.save(user);
    const tokens = await this.generateTokens(saved);
    await this.storeRefreshToken(saved.id, tokens.refreshToken);
    return { user: this.sanitizeUser(saved), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user || !user.passwordHash) {
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

  async exchangeGoogleCode(code: string) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID') || '';
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET') || '';
    const callbackUrl =
      this.configService.get<string>('GOOGLE_CALLBACK_URL') ||
      'http://localhost:3001/auth/google/callback';

    // Exchange authorization code for Google tokens
    const tokenResponse = await this.postJson<{
      access_token: string;
      error?: string;
    }>('oauth2.googleapis.com', '/token', {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      grant_type: 'authorization_code',
    });

    if (!tokenResponse.access_token) {
      throw new BadRequestException('Failed to exchange Google authorization code');
    }

    // Fetch Google user info
    const userInfo = await this.getJson<{
      sub: string;
      email: string;
      name: string;
      picture: string;
    }>('www.googleapis.com', '/oauth2/v3/userinfo', tokenResponse.access_token);

    const profile: GoogleProfile = {
      googleId: userInfo.sub,
      email: userInfo.email,
      fullName: userInfo.name,
      profilePicture: userInfo.picture || undefined,
    };

    return this.loginWithGoogle(profile);
  }

  async loginWithGoogle(profile: GoogleProfile) {
    let user = await this.userRepository.findOne({ where: { googleId: profile.googleId } });

    if (!user) {
      // Check if a user with the same email already exists
      user = await this.userRepository.findOne({ where: { email: profile.email } });

      if (user) {
        // Link Google account to existing email user
        user.googleId = profile.googleId;
        user.googleEmail = profile.email;
        user.profilePicture = user.profilePicture || profile.profilePicture;
        user.authProvider =
          user.authProvider === AuthProvider.EMAIL ? AuthProvider.EMAIL_GOOGLE : user.authProvider;
        user = await this.userRepository.save(user);
      } else {
        // Create a new user from Google profile
        user = this.userRepository.create({
          email: profile.email,
          fullName: profile.fullName,
          googleId: profile.googleId,
          googleEmail: profile.email,
          profilePicture: profile.profilePicture,
          authProvider: AuthProvider.GOOGLE,
          role: UserRole.CUSTOMER,
        });
        user = await this.userRepository.save(user);
      }
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

  private postJson<T>(hostname: string, path: string, body: Record<string, string>): Promise<T> {
    return new Promise((resolve, reject) => {
      const postData = new URLSearchParams(body).toString();
      const options = {
        hostname,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
      };
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('Invalid JSON from Google token endpoint'));
          }
        });
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  private getJson<T>(hostname: string, path: string, accessToken: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname,
        path,
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      };
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('Invalid JSON from Google userinfo endpoint'));
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
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
