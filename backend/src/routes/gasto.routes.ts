import express from 'express';
import { listarCobrosVivienda } from '../controllers/cobros.controller';
import { verificarToken } from '../middlewares/auth.middleware';
import { protegerModuloVivienda } from '../middlewares/module.guard';
import { listarGastos, crearGasto, listarDeudas, saldarDeuda } from '../controllers/gasto.controller';

const router = express.Router();
const gastosActivos = protegerModuloVivienda('gastos');

router.get('/:viviendaId/gastos', verificarToken, gastosActivos, listarGastos);
router.post('/:viviendaId/gastos', verificarToken, gastosActivos, crearGasto);
router.get('/:viviendaId/deudas', verificarToken, gastosActivos, listarDeudas);
router.get('/:viviendaId/cobros', verificarToken, gastosActivos, listarCobrosVivienda);
router.patch('/:viviendaId/deudas/:deudaId/saldar', verificarToken, gastosActivos, saldarDeuda);

export default router;
