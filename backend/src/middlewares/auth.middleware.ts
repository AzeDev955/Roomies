import express from 'express';
import jwt from 'jsonwebtoken';
import { RolUsuario } from '../generated/prisma/client';
import { getJwtSecret } from '../config/env';

export const verificarToken: express.RequestHandler = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    return;
  }

  let jwtSecret: string;
  try {
    jwtSecret = getJwtSecret();
  } catch (error) {
    next(error);
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id?: unknown; rol?: unknown };

    if (
      typeof decoded.id !== 'number' ||
      typeof decoded.rol !== 'string' ||
      !Object.values(RolUsuario).includes(decoded.rol as RolUsuario)
    ) {
      res.status(403).json({ error: 'Token invalido o expirado.' });
      return;
    }

    req.usuario = { id: decoded.id, rol: decoded.rol as RolUsuario };
    next();
  } catch {
    res.status(403).json({ error: 'Token invalido o expirado.' });
  }
};
