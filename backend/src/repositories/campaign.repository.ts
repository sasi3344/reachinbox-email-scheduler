import { EmailCampaign, Prisma } from '@prisma/client';
import { prisma, isDbAvailable } from '../config/db.config';

const memoryCampaigns: EmailCampaign[] = [];

export class CampaignRepository {
  async create(data: any): Promise<EmailCampaign> {
    if (isDbAvailable) {
      try {
        return await prisma.emailCampaign.create({ data });
      } catch {}
    }
    const resolvedUserId = data.userId || (data.user && data.user.connect && data.user.connect.id) || 'demo-user-123';
    const campaign: EmailCampaign = {
      id: `campaign-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: resolvedUserId,
      subject: data.subject,
      body: data.body,
      startTime: new Date(data.startTime),
      delayBetweenEmails: data.delayBetweenEmails,
      hourlyLimit: data.hourlyLimit,
      totalRecipients: data.totalRecipients,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryCampaigns.unshift(campaign);
    return campaign;
  }

  async findById(id: string, userId?: string): Promise<EmailCampaign | null> {
    if (isDbAvailable) {
      try {
        const where: Prisma.EmailCampaignWhereUniqueInput = { id };
        const campaign = await prisma.emailCampaign.findUnique({
          where,
          include: { _count: { select: { emails: true } } },
        });
        if (userId && campaign && campaign.userId !== userId) return null;
        return campaign;
      } catch {}
    }
    const found = memoryCampaigns.find((c) => c.id === id);
    if (!found) return null;
    if (userId && found.userId !== userId) return null;
    return found;
  }

  async findByUserId(userId: string): Promise<EmailCampaign[]> {
    if (isDbAvailable) {
      try {
        return await prisma.emailCampaign.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { emails: true } } },
        });
      } catch {}
    }
    return memoryCampaigns.filter((c) => c.userId === userId);
  }
}

export const campaignRepository = new CampaignRepository();
