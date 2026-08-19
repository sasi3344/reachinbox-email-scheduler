import { redisClient } from '../config/redis.config';
import { getHourWindowKey, getNextHourWindowDate } from '../utils/date-calculator';
import { logger } from '../utils/logger';

const RATE_LIMIT_LUA_SCRIPT = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local ttlSeconds = tonumber(ARGV[2])

local current = tonumber(redisClient.call('get', key) or "0")

if current < limit then
  local newVal = redisClient.call('incr', key)
  if newVal == 1 then
    redisClient.call('expire', key, ttlSeconds)
  end
  return { 1, newVal }
else
  return { 0, current }
end
`;

export interface RateLimitCheckResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  rescheduleTo?: Date;
  key: string;
}

const memoryRateLimit = new Map<string, number>();

export class RateLimiterService {
  async checkAndIncrement(
    userId: string,
    senderId: string,
    limit: number,
    targetDate: Date = new Date()
  ): Promise<RateLimitCheckResult> {
    const hourWindow = getHourWindowKey(targetDate);
    const key = `email-rate:${userId}:${senderId}:${hourWindow}`;
    const ttlSeconds = 7200;

    try {
      if (redisClient.status === 'ready' || redisClient.status === 'connect') {
        const result = (await redisClient.eval(
          RATE_LIMIT_LUA_SCRIPT,
          1,
          key,
          limit.toString(),
          ttlSeconds.toString()
        )) as [number, number];

        const allowed = result[0] === 1;
        const currentCount = result[1];

        if (!allowed) {
          const nextHour = getNextHourWindowDate(targetDate);
          return { allowed: false, currentCount, limit, rescheduleTo: nextHour, key };
        }
        return { allowed: true, currentCount, limit, key };
      }
    } catch {
      // Redis offline, fall through to memory counter
    }

    // In-Memory Rate Limiter Fallback
    const current = memoryRateLimit.get(key) || 0;
    if (current < limit) {
      memoryRateLimit.set(key, current + 1);
      return { allowed: true, currentCount: current + 1, limit, key };
    } else {
      const nextHour = getNextHourWindowDate(targetDate);
      return { allowed: false, currentCount: current, limit, rescheduleTo: nextHour, key };
    }
  }

  async getCurrentCount(userId: string, senderId: string, date: Date = new Date()): Promise<number> {
    const hourWindow = getHourWindowKey(date);
    const key = `email-rate:${userId}:${senderId}:${hourWindow}`;
    try {
      const countStr = await redisClient.get(key);
      if (countStr) return parseInt(countStr, 10);
    } catch {}
    return memoryRateLimit.get(key) || 0;
  }
}

export const rateLimiterService = new RateLimiterService();
