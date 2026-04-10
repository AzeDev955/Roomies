import express from 'express';
import { listarCobrosVivienda } from '../controllers/cobros.controller';
import { verificarToken } from '../middlewares/auth.middleware';
import { listarGastos, crearGasto, listarDeudas, saldarDeuda } from '../controllers/gasto.controller';

const router = express.Router();

router.get('/:viviendaId/gastos', verificarToken, listarGastos);
router.post('/:viviendaId/gastos', verificarToken, crearGasto);
router.get('/:viviendaId/deudas', verificarToken, listarDeudas);
router.get('/:viviendaId/cobros', verificarToken, listarCobrosVivienda);
router.patch('/:viviendaId/deudas/:deudaId/saldar', verificarToken, saldarDeuda);

export default router;
