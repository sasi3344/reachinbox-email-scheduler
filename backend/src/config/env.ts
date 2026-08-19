import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:5000/api/auth/google/callback'),
  JWT_SECRET: z.string().default('reachinbox_super_secret_jwt_key_default'),
  SESSION_SECRET: z.string().default('reachinbox_session_secret_default'),

  ETHEREAL_HOST: z.string().default('smtp.ethereal.email'),
  ETHEREAL_PORT: z.string().default('587').transform((val) => parseInt(val, 10)),
  ETHEREAL_USER: z.string().optional().default(''),
  ETHEREAL_PASSWORD: z.string().optional().default(''),
  FROM_EMAIL: z.string().default('scheduler@reachinbox.io'),
  FROM_NAME: z.string().default('ReachInbox Outreach'),

  WORKER_CONCURRENCY: z.string().default('5').transform((val) => parseInt(val, 10)),
  MIN_EMAIL_DELAY_MS: z.string().default('2000').transform((val) => parseInt(val, 10)),
  MAX_EMAILS_PER_HOUR: z.string().default('200').transform((val) => parseInt(val, 10)),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
