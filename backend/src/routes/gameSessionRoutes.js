import { Router } from 'express';
import * as gsController from '../controllers/gameSessionController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.post('/upload', authMiddleware, gsController.uploadGameRecord);
router.get('/detail', gsController.getDetail);

export default router;