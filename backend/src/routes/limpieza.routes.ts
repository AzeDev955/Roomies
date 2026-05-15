import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { protegerModuloVivienda } from '../middlewares/module.guard';
import { crearZona, listarZonas, actualizarZona, eliminarZona, asignarZonaFija, quitarAsignacionFija, generarTurnos, obtenerTurnos, exportarTurnos, marcarTurnoHecho } from '../controllers/limpieza.controller';

const router = express.Router();
const limpiezaActiva = protegerModuloVivienda('limpieza');

router.post('/:id/limpieza/zonas', verificarToken, limpiezaActiva, crearZona);
router.get('/:id/limpieza/zonas', verificarToken, limpiezaActiva, listarZonas);
router.put('/:id/limpieza/zonas/:zonaId', verificarToken, limpiezaActiva, actualizarZona);
router.delete('/:id/limpieza/zonas/:zonaId', verificarToken, limpiezaActiva, eliminarZona);
router.post('/:id/limpieza/zonas/:zonaId/asignacion', verificarToken, limpiezaActiva, asignarZonaFija);
router.delete('/:id/limpieza/zonas/:zonaId/asignacion', verificarToken, limpiezaActiva, quitarAsignacionFija);
router.post('/:id/limpieza/generar', verificarToken, limpiezaActiva, generarTurnos);
router.get('/:id/limpieza/turnos', verificarToken, limpiezaActiva, obtenerTurnos);
router.get('/:id/limpieza/turnos/export', verificarToken, limpiezaActiva, exportarTurnos);
router.patch('/:id/limpieza/turnos/:turnoId/hecho', verificarToken, limpiezaActiva, marcarTurnoHecho);

export default router;
