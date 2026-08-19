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

  // 0. Trust proxy (Required for Railway / Vercel / Render cloud load balancers)
  app.set('trust proxy', 1);

  // 1. Security HTTP Headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

  // 2. CORS configuration (Allow all origins with credentials for cloud deployments)
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server) or any origin
        callback(null, true);
      },
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
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      },
    })
  );

  // 5. Passport OAuth initialization
  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  // 6. Root health check endpoint for cloud load balancers
  app.get('/', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'ReachInbox Email Scheduler API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // 7. Public API rate limiter
  const publicApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    },
  });
  app.use('/api', publicApiLimiter);

  // 8. Mount API Routes
  app.use('/api', apiRoutes);

  // 9. 404 Route Catch-all
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.originalUrl} not found`,
    });
  });

  // 10. Centralized Error Middleware
  app.use(errorHandler);

  return app;
}
