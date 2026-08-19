import { Email, EmailStatus, Prisma } from '@prisma/client';
import { prisma, isDbAvailable } from '../config/db.config';

const memoryEmails: Email[] = [];

export class EmailRepository {
  async createMany(data: Prisma.EmailCreateManyInput[]): Promise<{ count: number }> {
    if (isDbAvailable) {
      try {
        return await prisma.email.createMany({ data });
      } catch {}
    }
    for (const item of data) {
      const record: Email = {
        id: (item.id as string) || `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        campaignId: item.campaignId,
        userId: item.userId,
        recipient: item.recipient,
        subject: item.subject,
        body: item.body,
        scheduledAt: new Date(item.scheduledAt),
        sentAt: item.sentAt ? new Date(item.sentAt) : null,
        status: (item.status as EmailStatus) || EmailStatus.SCHEDULED,
        attempts: item.attempts || 0,
        errorMessage: item.errorMessage || null,
        jobId: item.jobId || null,
        senderEmail: item.senderEmail || null,
        previewUrl: item.previewUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryEmails.push(record);
    }
    return { count: data.length };
  }

  async findById(id: string, userId?: string): Promise<Email | null> {
    if (isDbAvailable) {
      try {
        const email = await prisma.email.findUnique({ where: { id } });
        if (userId && email && email.userId !== userId) return null;
        return email;
      } catch {}
    }
    const found = memoryEmails.find((e) => e.id === id);
    if (!found) return null;
    if (userId && found.userId !== userId) return null;
    return found;
  }

  async findScheduled(userId: string, limit = 100): Promise<Email[]> {
    if (isDbAvailable) {
      try {
        return await prisma.email.findMany({
          where: {
            userId,
            status: { in: [EmailStatus.SCHEDULED, EmailStatus.PROCESSING] },
          },
          orderBy: { scheduledAt: 'asc' },
          take: limit,
        });
      } catch {}
    }
    return memoryEmails
      .filter((e) => e.userId === userId && (e.status === EmailStatus.SCHEDULED || e.status === EmailStatus.PROCESSING))
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
      .slice(0, limit);
  }

  async findSent(userId: string, limit = 100): Promise<Email[]> {
    if (isDbAvailable) {
      try {
        return await prisma.email.findMany({
          where: {
            userId,
            status: { in: [EmailStatus.SENT, EmailStatus.FAILED] },
          },
          orderBy: { sentAt: 'desc' },
          take: limit,
        });
      } catch {}
    }
    return memoryEmails
      .filter((e) => e.userId === userId && (e.status === EmailStatus.SENT || e.status === EmailStatus.FAILED))
      .sort((a, b) => (b.sentAt?.getTime() || b.updatedAt.getTime()) - (a.sentAt?.getTime() || a.updatedAt.getTime()))
      .slice(0, limit);
  }

  async findByCampaignId(campaignId: string, userId: string): Promise<Email[]> {
    if (isDbAvailable) {
      try {
        return await prisma.email.findMany({
          where: { campaignId, userId },
          orderBy: { scheduledAt: 'asc' },
        });
      } catch {}
    }
    return memoryEmails
      .filter((e) => e.campaignId === campaignId && e.userId === userId)
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  }

  async claimForProcessing(id: string): Promise<boolean> {
    if (isDbAvailable) {
      try {
        const result = await prisma.email.updateMany({
          where: { id, status: EmailStatus.SCHEDULED },
          data: { status: EmailStatus.PROCESSING, attempts: { increment: 1 } },
        });
        return result.count > 0;
      } catch {}
    }
    const email = memoryEmails.find((e) => e.id === id);
    if (email && email.status === EmailStatus.SCHEDULED) {
      email.status = EmailStatus.PROCESSING;
      email.attempts += 1;
      email.updatedAt = new Date();
      return true;
    }
    return false;
  }

  async markAsSent(id: string, previewUrl?: string): Promise<Email> {
    if (isDbAvailable) {
      try {
        return await prisma.email.update({
          where: { id },
          data: { status: EmailStatus.SENT, sentAt: new Date(), previewUrl, errorMessage: null },
        });
      } catch {}
    }
    const email = memoryEmails.find((e) => e.id === id)!;
    if (email) {
      email.status = EmailStatus.SENT;
      email.sentAt = new Date();
      email.previewUrl = previewUrl || null;
      email.errorMessage = null;
      email.updatedAt = new Date();
    }
    return email;
  }

  async markAsFailed(id: string, errorMessage: string): Promise<Email> {
    if (isDbAvailable) {
      try {
        return await prisma.email.update({
          where: { id },
          data: { status: EmailStatus.FAILED, errorMessage },
        });
      } catch {}
    }
    const email = memoryEmails.find((e) => e.id === id)!;
    if (email) {
      email.status = EmailStatus.FAILED;
      email.errorMessage = errorMessage;
      email.updatedAt = new Date();
    }
    return email;
  }

  async reschedule(id: string, newScheduledAt: Date): Promise<Email> {
    if (isDbAvailable) {
      try {
        return await prisma.email.update({
          where: { id },
          data: { status: EmailStatus.SCHEDULED, scheduledAt: newScheduledAt },
        });
      } catch {}
    }
    const email = memoryEmails.find((e) => e.id === id)!;
    if (email) {
      email.status = EmailStatus.SCHEDULED;
      email.scheduledAt = newScheduledAt;
      email.updatedAt = new Date();
    }
    return email;
  }

  async updateJobId(id: string, jobId: string): Promise<Email> {
    if (isDbAvailable) {
      try {
        return await prisma.email.update({ where: { id }, data: { jobId } });
      } catch {}
    }
    const email = memoryEmails.find((e) => e.id === id)!;
    if (email) {
      email.jobId = jobId;
    }
    return email;
  }
}

export const emailRepository = new EmailRepository();
