import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { dbConfig } from './config';
import * as schema from './schema';

const queryClient = postgres({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  ssl: dbConfig.ssl,
});

export const db = drizzle(queryClient, { schema });
export type Database = typeof db;