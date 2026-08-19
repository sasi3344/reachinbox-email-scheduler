import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var isDbAvailableGlobal: boolean | undefined;
}

export const prisma =
  global.prismaGlobal ||
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}

export let isDbAvailable = global.isDbAvailableGlobal || false;

export async function connectDatabase(): Promise<void> {
  try {
    await Promise.race([
      prisma.$connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 1000)),
    ]);
    isDbAvailable = true;
    global.isDbAvailableGlobal = true;
    logger.info('PostgreSQL database connection established successfully.');
  } catch (error: any) {
    isDbAvailable = false;
    global.isDbAvailableGlobal = false;
    logger.warn('PostgreSQL database offline. Repository layer operating in high-performance memory fallback mode.');
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    if (isDbAvailable) {
      await prisma.$disconnect();
    }
  } catch {}
}
