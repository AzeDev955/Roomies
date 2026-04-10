import express from 'express';
import {
  crearItemInventario,
  listarInventarioVivienda,
  marcarConformidadInventario,
  subirFotoInventario,
} from '../controllers/inventario.controller';
import { uploadInventarioFoto } from '../config/cloudinary.config';
import { verificarToken } from '../middlewares/auth.middleware';
import { protegerModuloVivienda, resolverViviendaIdDesdeItemInventario } from '../middlewares/module.guard';

const router = express.Router();
const inventarioActivo = protegerModuloVivienda('inventario');
const inventarioActivoPorItem = protegerModuloVivienda('inventario', resolverViviendaIdDesdeItemInventario);

router.post(
  '/viviendas/:viviendaId/inventario',
  verificarToken,
  inventarioActivo,
  crearItemInventario,
);

router.get(
  '/viviendas/:viviendaId/inventario',
  verificarToken,
  inventarioActivo,
  listarInventarioVivienda,
);

router.patch(
  '/inventario/:itemId/conformidad',
  verificarToken,
  inventarioActivoPorItem,
  marcarConformidadInventario,
);

router.post(
  '/inventario/:itemId/fotos',
  verificarToken,
  inventarioActivoPorItem,
  uploadInventarioFoto.single('foto'),
  subirFotoInventario,
);

export default router;
