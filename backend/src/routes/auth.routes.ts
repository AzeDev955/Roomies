import express from 'express';
import { register, login, obtenerMiPerfil, loginConGoogle, actualizarRol } from '../controllers/auth.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', loginConGoogle);
router.get('/me', verificarToken, obtenerMiPerfil);
router.patch('/rol', verificarToken, actualizarRol);

export default router;
