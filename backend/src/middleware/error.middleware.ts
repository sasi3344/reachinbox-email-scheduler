import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, {
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
