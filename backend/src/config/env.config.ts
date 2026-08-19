import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const stringOrNumberToNumber = (defaultVal: number) =>
  z
    .union([z.string(), z.number()])
    .default(defaultVal)
    .transform((v) => (typeof v === 'number' ? v : parseInt(v, 10) || defaultVal));

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: stringOrNumberToNumber(5000),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/reachinbox?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:5000/api/auth/google/callback'),

  // Session & Auth
  SESSION_SECRET: z.string().default('reachinbox-default-session-secret-key-12345'),
  JWT_SECRET: z.string().default('reachinbox-default-jwt-secret-key-67890'),

  // Ethereal / SMTP
  ETHEREAL_HOST: z.string().default('smtp.ethereal.email'),
  ETHEREAL_PORT: stringOrNumberToNumber(587),
  ETHEREAL_USER: z.string().optional().default(''),
  ETHEREAL_PASSWORD: z.string().optional().default(''),

  // Worker & Scheduler constraints
  WORKER_CONCURRENCY: stringOrNumberToNumber(5),
  MIN_EMAIL_DELAY_MS: stringOrNumberToNumber(2000),
  MAX_EMAILS_PER_HOUR: stringOrNumberToNumber(200),

  // Frontend App URL
  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
