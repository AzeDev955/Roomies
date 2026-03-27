import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { crearVivienda } from '../controllers/vivienda.controller';

const router = express.Router();

router.post('/', verificarToken, crearVivienda);

export default router;
