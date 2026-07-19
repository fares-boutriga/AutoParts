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
  const publicDir = join(process.cwd(), 'public');

  // Security Middlewares
  app.use(helmet({
    crossOriginResourcePolicy: false, // Allow serving static files
  }));
  app.use(cookieParser());

  // Serve frontend static build from server/public
  app.useStaticAssets(publicDir);

  // Enable CORS
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://192.168.208.1:5173',
    'http://localhost:5173',
    'http://192.168.1.9:5173',
  ].filter((origin): origin is string => Boolean(origin));

  app.enableCors({
    origin: allowedOrigins,
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

  // Swagger configuration
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

  const port = process.env.PORT || 3000;

  // Let React Router handle browser refreshes on client-side routes.
  // API routes are excluded so unknown API requests still return API errors.
  const apiPrefixes = [
    '/auth',
    '/users',
    '/roles',
    '/permissions',
    '/categories',
    '/outlets',
    '/products',
    '/stock',
    '/orders',
    '/customers',
    '/notifications',
    '/integrations',
    '/store-settings',
    '/dashboard',
  ];

  app.getHttpAdapter().getInstance().use((req, res, next) => {
    // Skip non-GET requests, static files, and actual API calls
    if (req.method !== 'GET' || req.path.includes('.')) {
      return next();
    }

    // Check if this is an actual API request (not a browser refresh)
    const accept = req.get('accept') || '';
    const isApiRequest = accept.includes('application/json');
    const isApiRoute = apiPrefixes.some(
      (prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`),
    );

    // If it's an API route AND an API request, let it through to the handler
    if (isApiRoute && isApiRequest) {
      return next();
    }

    // Otherwise, if it's not a static file, serve the frontend (React Router will handle it)
    if (!req.path.includes('.')) {
      return res.sendFile(join(publicDir, 'index.html'));
    }

    return next();
  });

  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
