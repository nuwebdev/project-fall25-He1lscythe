import { Router } from 'express';
import * as userController from '../controllers/userControllers.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/gamesession', authMiddleware, userController.getGameSessions);
router.get('/roundplayers', authMiddleware, userController.getRoundPlayers);
router.get('/datagrid/:id', userController.getDataGrid);
router.get('/search', userController.search);
router.get('/comparepoints', userController.comparePoints);
router.get('/:id', userController.getById);


export default router;