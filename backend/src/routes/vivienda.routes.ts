import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { listarViviendas, crearVivienda, obtenerVivienda, actualizarVivienda, crearHabitacion, editarHabitacion, eliminarHabitacion, expulsarInquilino } from '../controllers/vivienda.controller';
import { uploadViviendaFoto } from '../config/media-upload.config';
import {
  actualizarFotoVivienda,
  eliminarFotoVivienda,
  listarFotosVivienda,
  subirFotoVivienda,
} from '../controllers/foto-vivienda.controller';

const router = express.Router();

router.get('/', verificarToken, listarViviendas);
router.post('/', verificarToken, crearVivienda);
router.get('/:id/fotos', verificarToken, listarFotosVivienda);
router.post('/:id/fotos', verificarToken, uploadViviendaFoto.single('foto'), subirFotoVivienda);
router.patch('/:id/fotos/:fotoId', verificarToken, actualizarFotoVivienda);
router.delete('/:id/fotos/:fotoId', verificarToken, eliminarFotoVivienda);
router.get('/:id', verificarToken, obtenerVivienda);
router.patch('/:id', verificarToken, actualizarVivienda);
router.post('/:id/habitaciones', verificarToken, crearHabitacion);
router.put('/:id/habitaciones/:habId', verificarToken, editarHabitacion);
router.delete('/:id/habitaciones/:habId/inquilino', verificarToken, expulsarInquilino);
router.delete('/:id/habitaciones/:habId', verificarToken, eliminarHabitacion);

export default router;
