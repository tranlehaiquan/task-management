import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST as string,
  port: parseInt(process.env.DB_PORT as string),
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_NAME as string,
  ssl: process.env.DB_SSL === 'true' ? true : false,
}

if (!dbConfig.host || !dbConfig.port || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
  throw new Error('Missing database configuration');
}

export default defineConfig({
  schema: './src/schema/*',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    ssl: dbConfig.ssl,
  },
});