import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { crearIncidencia, listarIncidencias } from '../controllers/incidencia.controller';

const router = express.Router();

router.get('/', verificarToken, listarIncidencias);
router.post('/', verificarToken, crearIncidencia);

export default router;
