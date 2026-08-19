import Redis, { RedisOptions } from 'ioredis';
import { env } from './env.config';
import { logger } from '../utils/logger';

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 3) {
      return null;
    }
    return Math.min(times * 500, 2000);
  },
};

export const redisClient = new Redis(env.REDIS_URL, redisOptions);

redisClient.on('connect', () => {
  logger.info('Connected to Redis server.');
});

redisClient.on('error', (err) => {
  // Gracefully absorb Redis errors to protect production uptime
});

// Attempt connection safely
try {
  redisClient.connect().catch(() => {
    logger.warn(`Redis server not reachable at ${env.REDIS_URL} (operating in memory fallback mode).`);
  });
} catch {}

export const getRedisConnectionOptions = (): RedisOptions => {
  return redisOptions;
};

export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient.status === 'ready' || redisClient.status === 'connect') {
      await redisClient.quit();
    }
  } catch {}
}
