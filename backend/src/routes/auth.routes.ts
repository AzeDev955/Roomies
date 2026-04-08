import express from 'express';
import { register, login, obtenerMiPerfil, loginConGoogle, actualizarRol, verificarEmail } from '../controllers/auth.controller';
import { verificarToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registroSchema } from '../schemas/auth.schema';

const router = express.Router();

router.post('/register', validate(registroSchema), register);
router.get('/verificar/:token', verificarEmail);
router.post('/login', login);
router.post('/google', loginConGoogle);
router.get('/me', verificarToken, obtenerMiPerfil);
router.patch('/rol', verificarToken, actualizarRol);

export default router;
