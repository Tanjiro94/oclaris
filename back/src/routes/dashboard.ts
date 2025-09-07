import { Router } from 'express';
import { getDashboard } from '../modules/dashboard/controllers/dashboard.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = Router();

router.get('/dashboard', requireAuth, getDashboard);

export default router;