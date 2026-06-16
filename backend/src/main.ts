import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './common/filters/exception.filters';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set a global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Handle cors
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN : '*', // Allow all origins in development, restrict in production
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // Allow specific HTTP methods
    allowedHeaders: ['Content-Type, Authorization', 'refresh-token'], // Allow specific headers
  });

  // Pipe to ensure only valid request body and transform necessary things to its type accordingly
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

  // Catch and handle all exceptions/errors
  app.useGlobalFilters(new AllExceptionFilter());

  // Global interceptor to modify and send my custom response pattern
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
