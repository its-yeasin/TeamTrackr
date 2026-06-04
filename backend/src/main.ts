import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './common/filters/exception.filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set a global prefix for all routes
  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN : '*', // Allow all origins in development, restrict in production
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // Allow specific HTTP methods
    allowedHeaders: 'Content-Type, Authorization', // Allow specific headers
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
