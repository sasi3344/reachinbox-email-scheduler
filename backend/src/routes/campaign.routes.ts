import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', campaignController.getCampaigns);
router.get('/:id', campaignController.getCampaignById);

export const campaignRoutes = router;
