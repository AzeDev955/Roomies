import express from 'express';
import { uploadContratoAlquiler } from '../config/media-upload.config';
import {
  anularContratoAlquiler,
  crearContratoAlquiler,
  firmarContratoAlquiler,
  listarContratosVivienda,
  rechazarContratoAlquiler,
} from '../controllers/contrato.controller';
import { verificarToken } from '../middlewares/auth.middleware';
import { protegerModuloVivienda } from '../middlewares/module.guard';

const router = express.Router();
const gastosActivos = protegerModuloVivienda('gastos');

router.get('/:viviendaId/contratos', verificarToken, gastosActivos, listarContratosVivienda);
router.post(
  '/:viviendaId/contratos',
  verificarToken,
  gastosActivos,
  uploadContratoAlquiler.single('contrato'),
  crearContratoAlquiler,
);
router.patch('/:viviendaId/contratos/:contratoId/firmar', verificarToken, gastosActivos, firmarContratoAlquiler);
router.patch('/:viviendaId/contratos/:contratoId/rechazar', verificarToken, gastosActivos, rechazarContratoAlquiler);
router.patch('/:viviendaId/contratos/:contratoId/anular', verificarToken, gastosActivos, anularContratoAlquiler);

export default router;
