import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.config';
import { configurePassport } from './config/passport.config';
import { apiRoutes } from './routes';
import { errorHandler } from './middleware/error.middleware';

export function createApp(): express.Application {
  const app = express();

  // 1. Security HTTP Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows flexible UI assets in development
    })
  );

  // 2. CORS configuration
  app.use(
    cors({
      origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // 3. Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. Session management
  app.use(
    session({
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      },
    })
  );

  // 5. Passport OAuth initialization
  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  // 6. Public API rate limiter
  const publicApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    },
  });
  app.use('/api', publicApiLimiter);

  // 7. Mount API Routes
  app.use('/api', apiRoutes);

  // 8. 404 Route Catch-all
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.originalUrl} not found`,
    });
  });

  // 9. Centralized Error Middleware
  app.use(errorHandler);

  return app;
}
