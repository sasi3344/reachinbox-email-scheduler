import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { env } from '../config/env.config';
import { authService } from '../services/auth.service';
import { userRepository } from '../repositories/user.repository';
import { logger } from '../utils/logger';

function isRealGoogleOAuthConfigured(): boolean {
  return Boolean(
    env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_SECRET &&
    !env.GOOGLE_CLIENT_ID.includes('your-google-client-id') &&
    !env.GOOGLE_CLIENT_SECRET.includes('your-google-client-secret')
  );
}

export class AuthController {
  /**
   * Initiates Google OAuth flow with account selection prompt
   */
  async googleAuth(req: Request, res: Response, next: NextFunction) {
    if (!isRealGoogleOAuthConfigured()) {
      logger.warn('Google OAuth Client ID & Secret not configured in backend/.env.');
      return res.redirect(
        `${env.FRONTEND_URL}/login?error=google_oauth_needs_keys`
      );
    }

    return passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account', // Forces Google to show the account chooser
      session: true,
    })(req, res, next);
  }

  /**
   * Handles Google OAuth callback
   */
  googleCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('google', (err: any, user: any) => {
      if (err || !user) {
        logger.error('Google OAuth callback error:', { error: err });
        return res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) {
          logger.error('Error logging in user after OAuth:', { error: loginErr });
          return res.redirect(`${env.FRONTEND_URL}/login?error=login_failed`);
        }

        const token = authService.generateToken(user);
        return res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}`);
      });
    })(req, res, next);
  }

  /**
   * Allows login / signup with custom email address
   */
  async emailLogin(req: Request, res: Response) {
    try {
      const { email, name } = req.body;

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.',
        });
      }

      const cleanEmail = email.trim().toLowerCase();
      let user = await userRepository.findByEmail(cleanEmail);

      if (!user) {
        const defaultName = name?.trim() || cleanEmail.split('@')[0];
        user = await userRepository.create({
          googleId: `custom-user-${Date.now()}`,
          email: cleanEmail,
          name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}`,
        });
        logger.info(`Registered user via email login: ${user.email} (${user.id})`);
      }

      const token = authService.generateToken(user);

      req.logIn(user, (err) => {
        if (err) {
          logger.error('Email login session error:', { error: err });
        }
        return res.status(200).json({
          success: true,
          message: 'Authentication successful',
          data: {
            user: {
              id: user.id,
              googleId: user.googleId,
              email: user.email,
              name: user.name,
              avatar: user.avatar,
            },
            token,
          },
        });
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Email login failed',
      });
    }
  }

  /**
   * Returns current authenticated user information
   */
  getMe(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: req.user.id,
        googleId: req.user.googleId,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar,
      },
    });
  }

  /**
   * Logs out user and destroys session
   */
  logout(req: Request, res: Response) {
    req.logout((err) => {
      if (err) {
        logger.error('Logout error:', { error: err });
      }
      req.session?.destroy(() => {
        res.clearCookie('connect.sid');
        return res.status(200).json({
          success: true,
          message: 'Logged out successfully',
        });
      });
    });
  }

  /**
   * Quick developer demo login
   */
  async devLogin(req: Request, res: Response) {
    try {
      const devUser = await authService.getOrCreateDevUser();
      const token = authService.generateToken(devUser);

      req.logIn(devUser, (err) => {
        if (err) {
          logger.error('Dev login session error:', { error: err });
        }
        return res.status(200).json({
          success: true,
          message: 'Dev authentication successful',
          data: {
            user: devUser,
            token,
          },
        });
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Dev login failed',
      });
    }
  }
}

export const authController = new AuthController();
