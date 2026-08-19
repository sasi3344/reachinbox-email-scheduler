import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(
  res: Response,
  message = 'An unexpected error occurred',
  statusCode = 500,
  errors?: any
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
