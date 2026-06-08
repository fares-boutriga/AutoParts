import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security Middlewares
  app.use(helmet({
    crossOriginResourcePolicy: false, // Allow serving static files
  }));
  app.use(cookieParser());

  // Serve frontend static build from server/public
  app.useStaticAssets(join(process.cwd(), 'public'));

  // Enable CORS
  app.enableCors({
    origin: ['http://192.168.208.1:5173', 'http://localhost:5173', 'http://192.168.1.9:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration (Only in non-production)
  if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Auto Parts POS API')
        .setDescription(
          'Production-ready backend for car spare parts sales management',
        )
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Authentication')
        .addTag('Users')
        .addTag('Roles & Permissions')
        .addTag('Outlets')
        .addTag('Products')
        .addTag('Stock')
        .addTag('Orders')
        .addTag('Customers')
        .addTag('Notifications')
        .addTag('Dashboard')
        .build();
    
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production') {
      console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
