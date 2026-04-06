import express from 'express';
import { actualizarPushToken } from '../controllers/user.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.put('/push-token', verificarToken, actualizarPushToken);

export default router;
