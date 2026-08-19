import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { userRepository } from '../repositories/user.repository';
import { AuthenticatedUser } from '../types';

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Ensures the incoming HTTP request is authenticated via:
 * 1. Passport Session (`req.user` or `req.isAuthenticated()`)
 * 2. Authorization Header `Bearer <jwt_token>`
 * 3. Cookie token
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  // 1. Check Passport session
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }

  // 2. Check Bearer JWT token in Authorization header or query param
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    const payload = authService.verifyToken(token);
    if (payload) {
      const user = await userRepository.findById(payload.id);
      if (user) {
        req.user = {
          id: user.id,
          googleId: user.googleId,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        };
        return next();
      }
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Unauthorized: Please authenticate to access this resource.',
  });
}
