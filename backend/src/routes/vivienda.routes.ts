import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { listarViviendas, crearVivienda, obtenerVivienda, crearHabitacion, editarHabitacion, eliminarHabitacion, expulsarInquilino } from '../controllers/vivienda.controller';

const router = express.Router();

router.get('/', verificarToken, listarViviendas);
router.post('/', verificarToken, crearVivienda);
router.get('/:id', verificarToken, obtenerVivienda);
router.post('/:id/habitaciones', verificarToken, crearHabitacion);
router.put('/:id/habitaciones/:habId', verificarToken, editarHabitacion);
router.delete('/:id/habitaciones/:habId/inquilino', verificarToken, expulsarInquilino);
router.delete('/:id/habitaciones/:habId', verificarToken, eliminarHabitacion);

export default router;
