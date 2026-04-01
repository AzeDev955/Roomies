import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { crearIncidencia, listarIncidencias, obtenerIncidencia, editarIncidencia, eliminarIncidencia, actualizarEstadoIncidencia } from '../controllers/incidencia.controller';

const router = express.Router();

router.get('/', verificarToken, listarIncidencias);
router.post('/', verificarToken, crearIncidencia);
router.get('/:id', verificarToken, obtenerIncidencia);
router.put('/:id', verificarToken, editarIncidencia);
router.delete('/:id', verificarToken, eliminarIncidencia);
router.patch('/:id/estado', verificarToken, actualizarEstadoIncidencia);

export default router;
