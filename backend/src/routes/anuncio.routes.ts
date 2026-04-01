import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware';
import { listarAnuncios, crearAnuncio, eliminarAnuncio } from '../controllers/anuncio.controller';

const router = express.Router();

router.get('/', verificarToken, listarAnuncios);
router.post('/', verificarToken, crearAnuncio);
router.delete('/:id', verificarToken, eliminarAnuncio);

export default router;
