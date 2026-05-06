import express from 'express';
import { obtenerOcupacionFiscalVivienda } from '../controllers/fiscal.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/:viviendaId/fiscal/ocupacion', verificarToken, obtenerOcupacionFiscalVivienda);

export default router;
