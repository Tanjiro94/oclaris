import { Router } from 'express';
import { registerController } from './controllers/register.controller.js';
import { loginController } from './controllers/login.controller.js';
import { meController } from './controllers/me.controller.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { logoutController } from './controllers/logout.controller.js';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.get('/me', requireAuth, meController);
router.post('/logout', logoutController);

export default router;