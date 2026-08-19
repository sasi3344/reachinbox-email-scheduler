import winston from 'winston';

const { combine, timestamp, printf, colorize, json } = winston.format;

const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    // Sanitize any accidental sensitive fields
    const sanitized = { ...metadata };
    delete (sanitized as any).password;
    delete (sanitized as any).smtpPassword;
    delete (sanitized as any).googleClientSecret;
    delete (sanitized as any).sessionSecret;
    msg += ` ${JSON.stringify(sanitized)}`;
  }
  return msg;
});

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    process.env.NODE_ENV === 'production' ? json() : combine(colorize(), customFormat)
  ),
  transports: [
    new winston.transports.Console(),
  ],
});
