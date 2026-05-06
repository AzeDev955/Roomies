import express from 'express';
import {
  exportarDossierFiscalVivienda,
  obtenerOcupacionFiscalVivienda,
  obtenerResumenFiscalVivienda,
} from '../controllers/fiscal.controller';
import { verificarToken } from '../middlewares/auth.middleware';
import { protegerModuloVivienda } from '../middlewares/module.guard';

const router = express.Router();
const gastosActivos = protegerModuloVivienda('gastos');

router.get('/:viviendaId/fiscal/ocupacion', verificarToken, gastosActivos, obtenerOcupacionFiscalVivienda);
router.get('/:viviendaId/fiscal/:ejercicio/dossier', verificarToken, gastosActivos, exportarDossierFiscalVivienda);
router.get('/:viviendaId/fiscal/:ejercicio', verificarToken, gastosActivos, obtenerResumenFiscalVivienda);

export default router;
