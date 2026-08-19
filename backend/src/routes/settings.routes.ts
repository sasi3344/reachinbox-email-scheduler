import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';

const router = Router();

router.get('/smtp', (req, res) => settingsController.getSmtpSettings(req, res));
router.post('/smtp', (req, res) => settingsController.saveSmtpSettings(req, res));

export const settingsRoutes = router;
