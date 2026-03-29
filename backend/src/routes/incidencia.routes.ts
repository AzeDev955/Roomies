import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { crearIncidencia, listarIncidencias, actualizarEstadoIncidencia } from '../controllers/incidencia.controller';

const router = express.Router();

router.get('/', verificarToken, listarIncidencias);
router.post('/', verificarToken, crearIncidencia);
router.patch('/:id/estado', verificarToken, actualizarEstadoIncidencia);

export default router;
