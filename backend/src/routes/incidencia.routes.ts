import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { crearIncidencia } from '../controllers/incidencia.controller';

const router = express.Router();

router.post('/', verificarToken, crearIncidencia);

export default router;
