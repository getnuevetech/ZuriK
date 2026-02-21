import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const allowedOrigins = (
    process.env.FRONTEND_URL || 'http://localhost:3000'
  )
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

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
}
bootstrap();
