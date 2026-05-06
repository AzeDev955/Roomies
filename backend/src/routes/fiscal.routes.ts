import express from 'express';
import {
  exportarDossierFiscalVivienda,
  obtenerOcupacionFiscalVivienda,
  obtenerResumenFiscalVivienda,
} from '../controllers/fiscal.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/:viviendaId/fiscal/ocupacion', verificarToken, obtenerOcupacionFiscalVivienda);
router.get('/:viviendaId/fiscal/:ejercicio/dossier', verificarToken, exportarDossierFiscalVivienda);
router.get('/:viviendaId/fiscal/:ejercicio', verificarToken, obtenerResumenFiscalVivienda);

export default router;
