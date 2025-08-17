export type DBConfigType = {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
};

export const DB_OPTIONS = Symbol('DB_OPTIONS');
