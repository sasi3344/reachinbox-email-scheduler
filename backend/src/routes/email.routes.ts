import { Router } from 'express';
import { emailController, scheduleEmailSchema } from '../controllers/email.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

// Protect all email endpoints with authentication middleware
router.use(requireAuth);

router.post('/schedule', validateRequest(scheduleEmailSchema), emailController.schedule);
router.get('/scheduled', emailController.getScheduled);
router.get('/sent', emailController.getSent);
router.get('/:id', emailController.getById);

export const emailRoutes = router;
