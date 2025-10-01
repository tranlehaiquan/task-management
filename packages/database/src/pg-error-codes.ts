export const PG_ERROR_CODES = {
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUE_VIOLATION: '23505',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
} as const;

export interface PostgresError extends Error {
  cause: {
    code: string;
    constraint?: string;
    detail?: string;
    schema?: string;
    table?: string;
    column?: string;
  };
}

export function isPostgresError(error: unknown): error is PostgresError {
  return (
    error instanceof Error &&
    error.cause != null &&
    typeof error.cause === 'object' &&
    typeof (error.cause as any).code === 'string'
  );
}
