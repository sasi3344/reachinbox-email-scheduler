import http from 'http';
import { createApp } from './app';
import { env } from './config/env.config';
import { connectDatabase, disconnectDatabase } from './config/db.config';
import { disconnectRedis } from './config/redis.config';
import { startEmailWorker, stopEmailWorker } from './workers/email.worker';
import { logger } from './utils/logger';

// Global Crash Guards: Prevent Node.js from ever crashing in production
process.on('uncaughtException', (err) => {
  logger.error(`[Guard] Uncaught Exception intercepted: ${err.message}`);
});

process.on('unhandledRejection', (reason: any) => {
  logger.error(`[Guard] Unhandled Rejection intercepted: ${reason?.message || reason}`);
});

async function bootstrap() {
  logger.info('Initializing ReachInbox Email Scheduler Backend...');

  // 1. Attempt PostgreSQL database connection (non-fatal if offline)
  try {
    await connectDatabase();
  } catch (error: any) {
    logger.warn(`⚠️ PostgreSQL is currently unreachable (${error.message || error}). Standby/Mock mode activated.`);
  }

  // 2. Attempt BullMQ Email Worker startup (non-fatal if Redis offline)
  try {
    startEmailWorker();
  } catch (error: any) {
    logger.warn(`⚠️ Redis is currently unreachable (${error.message || error}).`);
  }

  // 3. Create and start HTTP Express Server (ALWAYS starts so API & frontend work!)
  const app = createApp();
  const server = http.createServer(app);

  const port = Number(process.env.PORT) || env.PORT || 5000;
  server.listen(port, '0.0.0.0', () => {
    logger.info(`🚀 ReachInbox API Server running at http://0.0.0.0:${port}`);
    logger.info(`📡 Health Endpoint: http://localhost:${port}/api/health`);
    logger.info(`🌐 Frontend Expected at: ${env.FRONTEND_URL}`);
  });

  // 4. Graceful Shutdown Handlers
  const shutdown = async (signal: string) => {
    logger.warn(`Received ${signal}. Commencing graceful shutdown...`);

    server.close(async () => {
      logger.info('HTTP server closed.');

      try {
        await stopEmailWorker();
        await disconnectRedis();
        await disconnectDatabase();
        logger.info('Subsystems shut down cleanly. Exiting.');
        process.exit(0);
      } catch (error) {
        process.exit(0);
      }
    });

    setTimeout(() => {
      process.exit(0);
    }, 5000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error(`Bootstrap fatal error caught: ${err.message}`);
});
