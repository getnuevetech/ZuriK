import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleCallbackDto } from './dto/google-auth.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req) {
    const { sub, refreshToken } = req.user;
    return this.authService.refresh(sub, refreshToken);
  }

  /**
   * POST /auth/google
   * Returns the Google OAuth2 authorization URL for the frontend to redirect the user.
   */
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuthUrl() {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const callbackUrl = encodeURIComponent(
      process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
    );
    const scope = encodeURIComponent('openid email profile');
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${clientId}` +
      `&redirect_uri=${callbackUrl}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&access_type=offline` +
      `&prompt=consent`;
    return { authUrl };
  }

  /**
   * POST /auth/google/callback
   * Exchange the authorization code for Google tokens, look up or create the user,
   * and return JWT access + refresh tokens.
   */
  @Post('google/callback')
  @HttpCode(HttpStatus.OK)
  async googleCallback(@Body() dto: GoogleCallbackDto) {
    return this.authService.exchangeGoogleCode(dto.code);
  }
}
