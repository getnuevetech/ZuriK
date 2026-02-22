import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { validateConfig } from './config/app.config';

async function bootstrap() {
  validateConfig();
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const allowedOrigins = (
    process.env.FRONTEND_URL || 'http://localhost:3000'
  )
    .split(',')
    .map((o) => o.trim());

  // Dynamic CORS: explicit allowlist + *.vercel.app preview deployments + localhost.
  // For production with a custom domain, set FRONTEND_URL explicitly.
  app.enableCors({
    origin: (origin, callback) => {
      // Allow server-to-server or same-origin requests (no Origin header)
      if (!origin) return callback(null, true);
      // Explicit allowlist (FRONTEND_URL env var)
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any *.vercel.app subdomain for preview deployments
      if (/\.vercel\.app$/.test(origin)) return callback(null, true);
      // Allow localhost in development only
      if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  logger.log(`CORS allowed origins: ${allowedOrigins.join(', ')} + *.vercel.app`);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('African Fashion Marketplace API')
      .setDescription('Phase 3: Admin Settings & Dynamic Fees')
      .setVersion('3.0')
      .addBearerAuth()
      .addTag('Authentication')
      .addTag('Users')
      .addTag('Products')
      .addTag('Fabrics')
      .addTag('Measurements')
      .addTag('Orders')
      .addTag('Admin Settings')
      .addTag('Admin Taxes')
      .addTag('Admin Shipping')
      .addTag('Admin Payments')
      .addTag('Upload')
      .addTag('Search')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    logger.log(`📚 Docs: http://localhost:${port}/docs`);
  }

  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 API: http://localhost:${port}`);

  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    logger.warn(
      'FRONTEND_URL is not set. CORS will only allow http://localhost:3000. ' +
      'Set FRONTEND_URL to your deployed frontend URL to avoid CORS errors in production.',
    );
  } else if (isProduction && /^https?:\/\/localhost(:\d+)?/.test(frontendUrl)) {
    logger.warn(
      `FRONTEND_URL is set to "${frontendUrl}" which points to localhost. ` +
      'This will cause CORS errors for production frontend requests.',
    );
  } else {
    logger.log(`✅ CORS allowed origins: ${allowedOrigins.join(', ')}`);
  }
}
bootstrap().catch((err) => {
  console.error('❌ Application failed to start:', err);
  process.exit(1);
});
