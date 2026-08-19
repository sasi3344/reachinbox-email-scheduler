import { Request, Response } from 'express';
import { campaignRepository } from '../repositories/campaign.repository';
import { emailRepository } from '../repositories/email.repository';
import { logger } from '../utils/logger';

export class CampaignController {
  /**
   * Retrieves all campaigns for the authenticated user
   */
  async getCampaigns(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const campaigns = await campaignRepository.findByUserId(userId);

      return res.status(200).json({
        success: true,
        data: campaigns,
      });
    } catch (error: any) {
      logger.error('Error fetching campaigns:', { error: error.message });
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve campaigns',
      });
    }
  }

  /**
   * Retrieves a specific campaign along with its individual email items
   */
  async getCampaignById(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const campaign = await campaignRepository.findById(id, userId);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campaign not found',
        });
      }

      const emails = await emailRepository.findByCampaignId(id, userId);

      return res.status(200).json({
        success: true,
        data: {
          ...campaign,
          emails,
        },
      });
    } catch (error: any) {
      logger.error(`Error fetching campaign ${req.params.id}:`, { error: error.message });
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve campaign details',
      });
    }
  }
}

export const campaignController = new CampaignController();
