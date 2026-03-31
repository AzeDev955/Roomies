import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { unirseHabitacion, obtenerMiVivienda } from '../controllers/inquilino.controller';

const router = express.Router();

router.post('/unirse', verificarToken, unirseHabitacion);
router.get('/vivienda', verificarToken, obtenerMiVivienda);

export default router;
