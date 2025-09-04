import { Router } from 'express';
import authRoutes from '../modules/auth/route.js';
import { verifyEmailController } from '../modules/auth/controllers/verify.controller.js';

const router = Router();

router.use('/auth', authRoutes);
router.get('/auth/verify', verifyEmailController);

export default router;