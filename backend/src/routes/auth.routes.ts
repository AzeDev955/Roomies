import express from 'express';
import { register, login } from '../controllers/auth.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verificarToken, (req, res) => {
  res.status(200).json(req.usuario);
});

export default router;
