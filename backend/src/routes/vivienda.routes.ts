import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { crearVivienda, crearHabitacion } from '../controllers/vivienda.controller';

const router = express.Router();

router.post('/', verificarToken, crearVivienda);
router.post('/:id/habitaciones', verificarToken, crearHabitacion);

export default router;
