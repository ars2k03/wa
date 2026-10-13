import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
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
  const port = process.env.PORT ?? 3002;
  await app.listen(port);
  logger.log(`WhatsApp OTP Gateway is running on port: ${port}`);
}
await bootstrap();
