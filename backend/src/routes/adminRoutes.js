import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { adminMiddleware } from '../middlewares/admin.js';

const router = Router();

// admin needs two middleware
router.use(authMiddleware, adminMiddleware);

router.get('/users', adminController.getAllUsers);
router.put('/user/:id/status', adminController.updateUserStatus);
router.delete('/gamesession/:uuid', adminController.deleteGameSession);

export default router;