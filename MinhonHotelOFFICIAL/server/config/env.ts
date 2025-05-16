import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
  DB_POOL_SIZE: z.string().optional(),
  DB_IDLE_TIMEOUT: z.string().optional(),
  DB_CONNECTION_TIMEOUT: z.string().optional(),
  REDIS_URL: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 minutes
  RATE_LIMIT_MAX: z.string().default('100'),
  CORS_ORIGIN: z.string().default('*'),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('1d'),
});

// Parse and validate environment variables
export const env = envSchema.parse(process.env);

// Type for environment variables
export type Env = z.infer<typeof envSchema>; 