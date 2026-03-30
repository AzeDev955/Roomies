import express from 'express';
import { register, login, obtenerMiPerfil } from '../controllers/auth.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verificarToken, obtenerMiPerfil);

export default router;
