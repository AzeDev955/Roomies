import express from 'express';
import { uploadJustificanteFoto } from '../config/cloudinary.config';
import { subirJustificanteDeuda } from '../controllers/deuda.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post(
  '/deudas/:deudaId/justificante',
  verificarToken,
  uploadJustificanteFoto.single('justificante'),
  subirJustificanteDeuda,
);

export default router;
