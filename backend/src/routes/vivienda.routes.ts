import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { listarViviendas, crearVivienda, crearHabitacion } from '../controllers/vivienda.controller';

const router = express.Router();

router.get('/', verificarToken, listarViviendas);
router.post('/', verificarToken, crearVivienda);
router.post('/:id/habitaciones', verificarToken, crearHabitacion);

export default router;
