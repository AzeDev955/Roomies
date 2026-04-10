import express from 'express';
import { uploadFacturaFoto, uploadFacturaGasto } from '../config/cloudinary.config';
import { listarCobrosVivienda } from '../controllers/cobros.controller';
import { verificarToken } from '../middlewares/auth.middleware';
import { protegerModuloVivienda } from '../middlewares/module.guard';
import {
  listarGastos,
  crearGasto,
  actualizarGasto,
  subirFacturaGasto,
  listarDeudas,
  saldarDeuda,
} from '../controllers/gasto.controller';

const router = express.Router();
const gastosActivos = protegerModuloVivienda('gastos');

router.get('/:viviendaId/gastos', verificarToken, gastosActivos, listarGastos);
router.post('/:viviendaId/gastos', verificarToken, gastosActivos, uploadFacturaGasto.single('factura'), crearGasto);
router.patch('/:viviendaId/gastos/:gastoId', verificarToken, gastosActivos, actualizarGasto);
router.post(
  '/:viviendaId/gastos/:gastoId/factura',
  verificarToken,
  gastosActivos,
  uploadFacturaFoto.single('factura'),
  subirFacturaGasto,
);
router.get('/:viviendaId/deudas', verificarToken, gastosActivos, listarDeudas);
router.get('/:viviendaId/cobros', verificarToken, gastosActivos, listarCobrosVivienda);
router.patch('/:viviendaId/deudas/:deudaId/saldar', verificarToken, gastosActivos, saldarDeuda);

export default router;
