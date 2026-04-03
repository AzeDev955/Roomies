import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { crearZona, listarZonas, actualizarZona, eliminarZona, asignarZonaFija, quitarAsignacionFija, generarTurnos } from '../controllers/limpieza.controller';

const router = express.Router();

router.post('/:id/limpieza/zonas', verificarToken, crearZona);
router.get('/:id/limpieza/zonas', verificarToken, listarZonas);
router.put('/:id/limpieza/zonas/:zonaId', verificarToken, actualizarZona);
router.delete('/:id/limpieza/zonas/:zonaId', verificarToken, eliminarZona);
router.post('/:id/limpieza/zonas/:zonaId/asignacion', verificarToken, asignarZonaFija);
router.delete('/:id/limpieza/zonas/:zonaId/asignacion', verificarToken, quitarAsignacionFija);
router.post('/:id/limpieza/generar', verificarToken, generarTurnos);

export default router;
