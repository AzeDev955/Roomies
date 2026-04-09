import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { crearGasto } from '../controllers/gasto.controller';

const router = express.Router();

router.post('/:viviendaId/gastos', verificarToken, crearGasto);

export default router;
