import { prisma, isDbAvailable } from '../config/db.config';
import { env } from '../config/env.config';

export interface SmtpCredentials {
  senderId?: string;
  email: string;
  host: string;
  port: number;
  user: string;
  pass: string;
}

const memorySmtpSettings = new Map<string, SmtpCredentials>();

export class SenderService {
  async saveSenderForUser(userId: string, creds: SmtpCredentials): Promise<SmtpCredentials> {
    memorySmtpSettings.set(userId, creds);

    if (isDbAvailable) {
      try {
        await prisma.senderAccount.upsert({
          where: { id: creds.senderId || `smtp-${userId}` },
          update: {
            email: creds.email,
            smtpHost: creds.host,
            smtpPort: creds.port,
            smtpUser: creds.user,
            smtpPassword: creds.pass,
            active: true,
          },
          create: {
            id: creds.senderId || `smtp-${userId}`,
            userId,
            email: creds.email,
            smtpHost: creds.host,
            smtpPort: creds.port,
            smtpUser: creds.user,
            smtpPassword: creds.pass,
            active: true,
          },
        });
      } catch {}
    }

    return creds;
  }

  async getSenderForUser(userId: string, requestedSenderId?: string): Promise<SmtpCredentials> {
    // Check in-memory custom config first
    if (memorySmtpSettings.has(userId)) {
      return memorySmtpSettings.get(userId)!;
    }

    if (isDbAvailable) {
      try {
        if (requestedSenderId) {
          const sender = await prisma.senderAccount.findFirst({
            where: { id: requestedSenderId, userId, active: true },
          });

          if (sender) {
            return {
              senderId: sender.id,
              email: sender.email,
              host: sender.smtpHost,
              port: sender.smtpPort,
              user: sender.smtpUser,
              pass: sender.smtpPassword,
            };
          }
        }

        const userSender = await prisma.senderAccount.findFirst({
          where: { userId, active: true },
          orderBy: { createdAt: 'asc' },
        });

        if (userSender) {
          return {
            senderId: userSender.id,
            email: userSender.email,
            host: userSender.smtpHost,
            port: userSender.smtpPort,
            user: userSender.smtpUser,
            pass: userSender.smtpPassword,
          };
        }
      } catch {}
    }

    return {
      senderId: 'default-ethereal',
      email: env.ETHEREAL_USER || 'no-reply@reachinbox.ethereal.email',
      host: env.ETHEREAL_HOST,
      port: env.ETHEREAL_PORT,
      user: env.ETHEREAL_USER,
      pass: env.ETHEREAL_PASSWORD,
    };
  }
}

export const senderService = new SenderService();
