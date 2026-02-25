import { Logger } from '@nestjs/common';

export const appConfig = () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
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
    logger.error('='.repeat(60));
    logger.error('MISSING REQUIRED ENVIRONMENT VARIABLES');
    logger.error('='.repeat(60));
    missing.forEach((key) => {
      logger.error(`  ❌ ${key} is not set`);
    });
    logger.error('');
    logger.error('To fix this on Railway:');
    logger.error('  1. Go to your service in the Railway Dashboard');
    logger.error('  2. Click the "Variables" tab');
    logger.error('  3. Add the missing variables listed above');
    logger.error('');
    logger.error('For DATABASE_URL: Add a PostgreSQL plugin via "+ New" → "Database"');
    logger.error('For JWT secrets: Generate with `openssl rand -base64 32`');
    logger.error('For FRONTEND_URL: Set to your deployed frontend URL');
    logger.error('='.repeat(60));
    throw new Error(
      `Missing required environment variables in production: ${missing.join(', ')}. ` +
      'Set these in your Railway Dashboard under the "Variables" tab.'
    );
  }

  logger.log('✅ All required environment variables are set');
}
