import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { unirseHabitacion } from '../controllers/inquilino.controller';

const router = express.Router();

router.post('/unirse', verificarToken, unirseHabitacion);

export default router;
