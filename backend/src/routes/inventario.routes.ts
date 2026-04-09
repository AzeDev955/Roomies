import express from 'express';
import {
  crearItemInventario,
  listarInventarioVivienda,
  subirFotoInventario,
} from '../controllers/inventario.controller';
import { uploadInventarioFoto } from '../config/cloudinary.config';
import { verificarToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post(
  '/viviendas/:viviendaId/inventario',
  verificarToken,
  crearItemInventario,
);

router.get(
  '/viviendas/:viviendaId/inventario',
  verificarToken,
  listarInventarioVivienda,
);

router.post(
  '/inventario/:itemId/fotos',
  verificarToken,
  uploadInventarioFoto.single('foto'),
  subirFotoInventario,
);

export default router;
