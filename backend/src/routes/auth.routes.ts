import express from 'express';
import { register, login, obtenerMiPerfil, loginConGoogle } from '../controllers/auth.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', loginConGoogle);
router.get('/me', verificarToken, obtenerMiPerfil);

export default router;
