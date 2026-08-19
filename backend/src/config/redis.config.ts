import Redis, { RedisOptions } from 'ioredis';
import { env } from './env.config';
import { logger } from '../utils/logger';

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 5) {
      return null; // Stop retrying if Redis is not available locally
    }
    return Math.min(times * 300, 2000);
  },
};

export const redisClient = new Redis(env.REDIS_URL, redisOptions);

// Connect asynchronously without blocking bootstrap
redisClient.connect().catch((err) => {
  logger.warn(`Redis server not reachable at ${env.REDIS_URL} (operating in memory fallback mode): ${err.message}`);
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis server.');
});

redisClient.on('error', (err) => {
  // Silence repetitive unhandled error spam
});

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
