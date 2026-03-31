import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { unirseHabitacion, obtenerMiVivienda, abandonarHabitacion } from '../controllers/inquilino.controller';

const router = express.Router();

router.post('/unirse', verificarToken, unirseHabitacion);
router.get('/vivienda', verificarToken, obtenerMiVivienda);
router.delete('/habitacion', verificarToken, abandonarHabitacion);

export default router;
