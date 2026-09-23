import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger OpenAPI Documentation Configuration
  const config = new DocumentBuilder()
    .setTitle('AscendiaOS Monorepo API')
    .setDescription(
      'Complete Backend REST API for AscendiaOS — Exam Management & Study Infrastructure Platform. Created by sukhwinder-i0 (https://github.com/sukhwinder-i0)',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .setContact('sukhwinder-i0', 'https://github.com/sukhwinder-i0', '')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 AscendiaOS API is running on http://0.0.0.0:${port}/api`);
  console.log(`📚 OpenAPI Docs available at http://localhost:${port}/api/docs`);
  console.log(`👤 Created by sukhwinder-i0 (https://github.com/sukhwinder-i0)`);
}

bootstrap();
