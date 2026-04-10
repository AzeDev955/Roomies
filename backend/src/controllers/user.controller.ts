import express from 'express';
import { prisma } from '../lib/prisma';

export const actualizarPushToken: express.RequestHandler = async (req, res) => {
  const { token } = req.body as { token?: unknown };

  if (token !== null && (typeof token !== 'string' || token.trim().length === 0)) {
    res.status(400).json({ error: 'Debes enviar un token valido.' });
    return;
  }

  const tokenNormalizado = typeof token === 'string' ? token.trim() : null;

  await prisma.usuario.update({
    where: { id: req.usuario!.id },
    data: { expo_push_token: tokenNormalizado },
  });

  res.status(200).json({ mensaje: 'Push token actualizado.' });
};
