import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolClient } from 'pg';
import * as schema from './schema';
import { DB_OPTIONS, DBConfigType } from './database.interface';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  public db: ReturnType<typeof drizzle>;

  constructor(@Inject(DB_OPTIONS) private options: DBConfigType) {
    this.pool = new Pool({
      host: this.options.host,
      port: this.options.port,
      user: this.options.user,
      password: this.options.password,
      database: this.options.database,
      ssl: this.options.ssl ? { rejectUnauthorized: false } : undefined,
    });

    this.db = drizzle(this.pool, { schema, logger: true });
  }

  async onModuleInit() {
    let client: PoolClient | undefined;
    try {
      client = await this.pool.connect();
      console.log('Connected to database with Drizzle');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    } finally {
      client?.release();
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
