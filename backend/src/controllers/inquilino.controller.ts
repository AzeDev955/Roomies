import express from 'express';
import { prisma } from '../lib/prisma';
import { RolUsuario } from '../generated/prisma/client';

export const obtenerPerfilInquilino: express.RequestHandler = async (req, res) => {
  const id = Number(req.params['id']);
  if (isNaN(id)) {
    res.status(400).json({ error: 'ID inválido.' });
    return;
  }

  const habitacion = await prisma.habitacion.findFirst({
    where: {
      inquilino_id: id,
      vivienda: { casero_id: req.usuario!.id },
    },
    include: {
      inquilino: {
        select: { id: true, nombre: true, apellidos: true, email: true, telefono: true },
      },
      vivienda: { select: { id: true, alias_nombre: true } },
    },
  });

  if (!habitacion?.inquilino) {
    res.status(403).json({ error: 'No tienes acceso al perfil de este usuario.' });
    return;
  }

  res.status(200).json({
    ...habitacion.inquilino,
    habitacion: { id: habitacion.id, nombre: habitacion.nombre },
    vivienda: habitacion.vivienda,
  });
};

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

export const abandonarHabitacion: express.RequestHandler = async (req, res) => {
  if (req.usuario!.rol !== RolUsuario.INQUILINO) {
    res.status(403).json({ error: 'Solo los inquilinos pueden usar este endpoint.' });
    return;
  }

  const habitacion = await prisma.habitacion.findFirst({
    where: { inquilino_id: req.usuario!.id },
  });

  if (!habitacion) {
    res.status(404).json({ error: 'No tienes ninguna habitación asignada.' });
    return;
  }

  await prisma.habitacion.update({
    where: { id: habitacion.id },
    data: { inquilino_id: null },
  });

  res.status(200).json({ mensaje: 'Has abandonado la habitación correctamente.' });
};

export const obtenerMiVivienda: express.RequestHandler = async (req, res) => {
  if (req.usuario!.rol !== RolUsuario.INQUILINO) {
    res.status(403).json({ error: 'Solo los inquilinos pueden usar este endpoint.' });
    return;
  }

  const habitacion = await prisma.habitacion.findFirst({
    where: { inquilino_id: req.usuario!.id },
    include: {
      vivienda: {
        include: {
          habitaciones: {
            include: {
              inquilino: { select: { id: true, nombre: true, apellidos: true } },
            },
          },
        },
      },
    },
  });

  if (!habitacion) {
    res.status(404).json({ error: 'No tienes ninguna habitación asignada.' });
    return;
  }

  res.status(200).json({
    miHabitacionId: habitacion.id,
    vivienda: habitacion.vivienda,
  });
};
