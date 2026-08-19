import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { emailRoutes } from './email.routes';
import { campaignRoutes } from './campaign.routes';
import { healthRoutes } from './health.routes';
import { settingsRoutes } from './settings.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/emails', emailRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/health', healthRoutes);
router.use('/settings', settingsRoutes);

export const apiRoutes = router;
