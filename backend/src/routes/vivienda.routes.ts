import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { listarViviendas, crearVivienda, obtenerVivienda, crearHabitacion } from '../controllers/vivienda.controller';

const router = express.Router();

router.get('/', verificarToken, listarViviendas);
router.post('/', verificarToken, crearVivienda);
router.get('/:id', verificarToken, obtenerVivienda);
router.post('/:id/habitaciones', verificarToken, crearHabitacion);

export default router;
