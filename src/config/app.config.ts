import { Logger } from '@nestjs/common';

export const appConfig = () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    // Fallback to JWT_SECRET is for development backward-compatibility only.
    // In production, JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required by validateConfig().
    accessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  },
});

const REQUIRED_PRODUCTION_VARS = [
  'FRONTEND_URL',
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

export function validateConfig(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const logger = new Logger('Config');
  const missing = REQUIRED_PRODUCTION_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const message = `Missing required environment variables in production: ${missing.join(', ')}`;
    logger.error(message);
    throw new Error(message);
  }
}
