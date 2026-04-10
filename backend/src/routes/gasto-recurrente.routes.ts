import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import {
  crearGastoRecurrente,
  listarGastosRecurrentes,
} from '../controllers/gasto-recurrente.controller';

const router = express.Router();

router.get('/:viviendaId/gastos-recurrentes', verificarToken, listarGastosRecurrentes);
router.post('/:viviendaId/gastos-recurrentes', verificarToken, crearGastoRecurrente);

export default router;
