import express from 'express';
import jwt from 'jsonwebtoken';
import { RolUsuario } from '../generated/prisma/client';

export const verificarToken: express.RequestHandler = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env['JWT_SECRET']!
    ) as { id: number; rol: RolUsuario };
    req.usuario = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};
