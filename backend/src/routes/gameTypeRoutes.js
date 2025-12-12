import { Router } from 'express';
import * as gtController from '../controllers/gameTypeController.js';

const router = Router();

router.get('/list', gtController.getList);
router.get('/detail', gtController.getDetail);

export default router;