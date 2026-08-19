import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.config';
import { userRepository } from '../repositories/user.repository';
import { logger } from '../utils/logger';

export function configurePassport(): void {
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await userRepository.findById(id);
      done(null, user || false);
    } catch (err) {
      done(err, null);
    }
  });

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: env.GOOGLE_CALLBACK_URL,
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const googleId = profile.id;
            const email = profile.emails?.[0]?.value;
            const name = profile.displayName || profile.name?.givenName || 'Google User';
            const avatar = profile.photos?.[0]?.value || null;

            if (!email) {
              return done(new Error('No email found in Google profile'), undefined);
            }

            const user = await userRepository.upsertGoogleUser({
              googleId,
              email,
              name,
              avatar,
            });

            logger.info(`Google user authenticated: ${user.email} (${user.id})`);
            return done(null, user);
          } catch (error) {
            logger.error('Error during Google authentication:', { error });
            return done(error as Error, undefined);
          }
        }
      )
    );
    logger.info('Passport Google OAuth Strategy configured successfully.');
  } else {
    logger.warn(
      'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not configured. Real Google OAuth is disabled; fallback dev authentication endpoint is enabled.'
    );
  }
}
