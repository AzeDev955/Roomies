import express from 'express';
import { register, login, obtenerMiPerfil, loginConGoogle, actualizarRol, verificarEmail } from '../controllers/auth.controller';
import { verificarToken } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { actualizarRolSchema, googleLoginSchema, loginSchema, registroSchema } from '../schemas/auth.schema';

const router = express.Router();

router.post('/register', validate(registroSchema, 'Datos de registro invalidos.'), register);
router.get('/verificar/:token', verificarEmail);
router.post('/login', validate(loginSchema, 'Datos de login invalidos.'), login);
router.post('/google', validate(googleLoginSchema, 'Datos de Google OAuth invalidos.'), loginConGoogle);
router.get('/me', verificarToken, obtenerMiPerfil);
router.patch('/rol', verificarToken, validate(actualizarRolSchema, 'Datos de rol invalidos.'), actualizarRol);

export default router;
