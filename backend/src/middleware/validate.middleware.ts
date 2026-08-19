import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response.util.js';

export const validateRequest =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return sendError(res, 'Validation error', 400, issues);
      }
      return sendError(res, 'Invalid request data', 400);
    }
  };
