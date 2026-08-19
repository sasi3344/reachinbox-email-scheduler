import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';
import { env } from './env.js';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'info' },
            { emit: 'stdout', level: 'warn' },
          ]
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export async function connectPrisma(): Promise<boolean> {
  try {
    await prisma.$connect();
    logger.info(' Connected to PostgreSQL database via Prisma');
    return true;
  } catch (error: any) {
    logger.warn(`⚠️ PostgreSQL connection attempt failed (${error.message || 'connection refused'}). Ensure PostgreSQL is running at ${env.DATABASE_URL}`);
    return false;
  }
}

export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info(' Disconnected from PostgreSQL database');
  } catch {
    // Ignore disconnect error if was never connected
  }
}
