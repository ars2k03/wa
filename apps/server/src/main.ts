import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

// Suppress noisy internal libsignal cryptographic logs in terminal
const originalInfo = console.info;
console.info = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].startsWith('Closing session:') ||
      args[0].startsWith('Opening session:') ||
      args[0].startsWith('Removing old closed session:') ||
      args[0].startsWith('Migrating session to:'))
  ) {
    return;
  }
  originalInfo(...args);
};

const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('session in favor of incoming') ||
      args[0].includes('Session already') ||
      args[0].includes('Decrypted message with closed session'))
  ) {
    return;
  }
  originalWarn(...args);
};

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security headers via Helmet
  app.use(helmet());

  // Strictly controlled CORS policy
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

  app.enableCors({
    origin: (
      requestOrigin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or matching allowed origins
      if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT ?? 3002;
  await app.listen(port);
  logger.log(`WhatsApp OTP Gateway is running on port: ${port}`);
}
await bootstrap();
