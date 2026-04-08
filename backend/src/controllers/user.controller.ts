import express from 'express';
import { prisma } from '../lib/prisma';

export const actualizarPushToken: express.RequestHandler = async (req, res) => {
  const { token } = req.body as { token: string };

  await prisma.usuario.update({
    where: { id: req.usuario!.id },
    data: { expo_push_token: token ?? null },
  });

  res.status(200).json({ mensaje: 'Push token actualizado.' });
};
