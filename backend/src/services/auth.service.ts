import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { userRepository } from '../repositories/user.repository';
import { AuthenticatedUser } from '../types';
import { logger } from '../utils/logger';

export class AuthService {
  /**
   * Generates a signed JWT token for an authenticated user.
   */
  generateToken(user: AuthenticatedUser): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Verifies and decodes a JWT token.
   */
  verifyToken(token: string): { id: string; email: string; name: string } | null {
    try {
      return jwt.verify(token, env.JWT_SECRET) as { id: string; email: string; name: string };
    } catch {
      return null;
    }
  }

  /**
   * For local developer demonstration when Google OAuth client credentials aren't configured yet.
   */
  async getOrCreateDevUser(): Promise<AuthenticatedUser> {
    const devEmail = 'demo.user@reachinbox.ai';
    let user = await userRepository.findByEmail(devEmail);

    if (!user) {
      user = await userRepository.create({
        googleId: 'dev-google-id-001',
        email: devEmail,
        name: 'Demo Architect',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      });
      logger.info(`Created default developer demo user: ${user.email}`);
    }

    return {
      id: user.id,
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    };
  }
}

export const authService = new AuthService();
