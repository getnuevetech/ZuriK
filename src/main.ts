import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('African Fashion Marketplace API')
    .setDescription('Complete API with JWT auth, multi-role system, order workflow')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication')
    .addTag('Users')
    .addTag('Products')
    .addTag('Fabrics')
    .addTag('Measurements')
    .addTag('Orders')
    .addTag('QA')
    .addTag('Admin - Settings')
    .addTag('Admin - Taxes')
    .addTag('Admin - Payments')
    .addTag('Admin - Shipping')
    .addTag('Upload')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 API: http://localhost:${port}`);
  logger.log(`📚 Docs: http://localhost:${port}/docs`);
}
bootstrap();
