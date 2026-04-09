import express from 'express';
import { subirFotoInventario } from '../controllers/inventario.controller';
import { uploadInventarioFoto } from '../config/cloudinary.config';
import { verificarToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post(
  '/:itemId/fotos',
  verificarToken,
  uploadInventarioFoto.single('foto'),
  subirFotoInventario,
);

export default router;
