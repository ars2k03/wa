import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;
  private readonly isConfigured: boolean;

  constructor(private readonly config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL');

    const isSupabase =
      connectionString?.includes('supabase.com') ||
      connectionString?.includes('supabase.co');

    const pool = new Pool({
      connectionString:
        connectionString ||
        'postgresql://postgres:postgres@localhost:5432/whatsapp',
      ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    });

    const adapter = new PrismaPg(pool);

    super({ adapter });

    this.pool = pool;
    this.isConfigured = Boolean(connectionString);
  }

  async onModuleInit() {
    if (this.isConfigured) {
      try {
        await this.$connect();
        this.logger.log('Database connected successfully ✅');
      } catch (err) {
        this.logger.error('Failed to connect to database', err);
      }
    } else {
      this.logger.warn('DATABASE_URL is not provided yet in .env');
    }
  }

  async onModuleDestroy() {
    if (this.isConfigured) {
      await this.$disconnect();
    }
    await this.pool?.end();
  }
}
