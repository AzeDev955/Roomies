import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { crearZona, listarZonas, actualizarZona, asignarZonaFija } from '../controllers/limpieza.controller';

const router = express.Router();

router.post('/:id/limpieza/zonas', verificarToken, crearZona);
router.get('/:id/limpieza/zonas', verificarToken, listarZonas);
router.put('/:id/limpieza/zonas/:zonaId', verificarToken, actualizarZona);
router.post('/:id/limpieza/zonas/:zonaId/asignacion', verificarToken, asignarZonaFija);

export default router;
