import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Return 501 when Google OAuth credentials are not configured rather than
    // crashing with an "Unknown authentication strategy" error.
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      const response = context.switchToHttp().getResponse();
      response
        .status(501)
        .json({ message: 'Google OAuth is not configured on this server.' });
      return false;
    }
    const activate = (await super.canActivate(context)) as boolean;
    return activate;
  }
}
