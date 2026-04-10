import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { protegerModuloVivienda } from '../middlewares/module.guard';
import {
  crearGastoRecurrente,
  listarGastosRecurrentes,
} from '../controllers/gasto-recurrente.controller';

const router = express.Router();
const gastosActivos = protegerModuloVivienda('gastos');

router.get('/:viviendaId/gastos-recurrentes', verificarToken, gastosActivos, listarGastosRecurrentes);
router.post('/:viviendaId/gastos-recurrentes', verificarToken, gastosActivos, crearGastoRecurrente);

export default router;
