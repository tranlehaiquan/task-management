import { Injectable, OnModuleInit } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool: Pool;
  public db: ReturnType<typeof drizzle>;

  constructor() {
    // TODO: move to config module
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "task_management",
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    };

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      ssl: dbConfig.ssl,
    });

    this.db = drizzle(this.pool, { schema, logger: true });
  }

  async onModuleInit() {
    try {
      await this.pool.connect();
      console.log("Connected to database with Drizzle");
    } catch (error) {
      console.error("Failed to connect to database:", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
