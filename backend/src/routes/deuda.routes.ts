import express from 'express';
import { uploadJustificanteFoto } from '../config/cloudinary.config';
import { subirJustificanteDeuda } from '../controllers/deuda.controller';
import { verificarToken } from '../middlewares/auth.middleware';
import { protegerModuloVivienda, resolverViviendaIdDesdeDeuda } from '../middlewares/module.guard';

const router = express.Router();
const gastosActivosPorDeuda = protegerModuloVivienda('gastos', resolverViviendaIdDesdeDeuda);

router.post(
  '/deudas/:deudaId/justificante',
  verificarToken,
  gastosActivosPorDeuda,
  uploadJustificanteFoto.single('justificante'),
  subirJustificanteDeuda,
);

export default router;
