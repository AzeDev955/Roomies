import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { listarGastos, crearGasto } from '../controllers/gasto.controller';

const router = express.Router();

router.get('/:viviendaId/gastos', verificarToken, listarGastos);
router.post('/:viviendaId/gastos', verificarToken, crearGasto);

export default router;
