import { Request, Response } from 'express';
import { prisma } from '../config/db.config';
import { redisClient } from '../config/redis.config';
import { emailWorker } from '../workers/email.worker';

export class HealthController {
  async getHealth(req: Request, res: Response) {
    let dbStatus = 'disconnected';
    let redisStatus = 'disconnected';
    const workerStatus = emailWorker && emailWorker.isRunning() ? 'running' : 'idle / fallback';

    // 1. Check PostgreSQL
    try {
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 500)),
      ]);
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }

    // 2. Check Redis
    try {
      if (redisClient.status === 'ready' || redisClient.status === 'connect') {
        const pingRes = await Promise.race([
          redisClient.ping(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 500)),
        ]);
        if (pingRes === 'PONG') {
          redisStatus = 'connected';
        }
      }
    } catch {
      redisStatus = 'disconnected';
    }

    const isHealthy = true; // Always return 200 with status breakdown

    return res.status(200).json({
      status: dbStatus === 'connected' && redisStatus === 'connected' ? 'ok' : 'ready (memory-mode)',
      database: dbStatus,
      redis: redisStatus,
      worker: workerStatus,
      timestamp: new Date().toISOString(),
    });
  }
}

export const healthController = new HealthController();
