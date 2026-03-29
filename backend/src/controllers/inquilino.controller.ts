import express from 'express';
import { prisma } from '../lib/prisma';
import { RolUsuario } from '../generated/prisma/client';

export const unirseHabitacion: express.RequestHandler = async (req, res) => {
  if (req.usuario!.rol !== RolUsuario.INQUILINO) {
    res.status(403).json({ error: 'Solo los inquilinos pueden unirse a una habitación.' });
    return;
  }

  const { codigo_invitacion } = req.body as { codigo_invitacion: string };

  if (!codigo_invitacion) {
    res.status(400).json({ error: 'codigo_invitacion es obligatorio.' });
    return;
  }

  const habitacion = await prisma.habitacion.findUnique({
    where: { codigo_invitacion },
  });

  if (!habitacion) {
    res.status(404).json({ error: 'Código de invitación inválido.' });
    return;
  }

  if (habitacion.inquilino_id !== null) {
    res.status(400).json({ error: 'Esta habitación ya está ocupada.' });
    return;
  }

  const habitacionActualizada = await prisma.habitacion.update({
    where: { codigo_invitacion },
    data: { inquilino_id: req.usuario!.id },
    include: { vivienda: true },
  });

  res.status(200).json({
    mensaje: 'Te has unido a la habitación correctamente.',
    habitacion: habitacionActualizada,
  });
};
