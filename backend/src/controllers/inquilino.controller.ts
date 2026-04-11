import express from 'express';
import { prisma } from '../lib/prisma';
import { RolUsuario } from '../generated/prisma/client';
import { generarCodigoInvitacion } from '../utils/generarCodigo';
import { enviarNotificacionPush } from '../services/notification.service';

const serializarHabitacionParaInquilino = <
  T extends { precio: number | null; codigo_invitacion: string | null; inquilino_id?: number | null },
>(
  habitacion: T,
  usuarioId: number,
): Omit<T, 'precio' | 'codigo_invitacion'> & { precio: number | null; codigo_invitacion: null } => ({
  ...habitacion,
  precio: habitacion.inquilino_id === usuarioId ? habitacion.precio : null,
  codigo_invitacion: null,
});

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

export const obtenerPerfilCompañero: express.RequestHandler = async (req, res) => {
  const compId = Number(req.params['id']);
  if (isNaN(compId)) {
    res.status(400).json({ error: 'ID inválido.' });
    return;
  }

  const miHabitacion = await prisma.habitacion.findFirst({
    where: { inquilino_id: req.usuario!.id },
    select: { vivienda_id: true },
  });

  if (!miHabitacion) {
    res.status(403).json({ error: 'No tienes una vivienda asignada.' });
    return;
  }

  const suHabitacion = await prisma.habitacion.findFirst({
    where: {
      inquilino_id: compId,
      vivienda_id: miHabitacion.vivienda_id,
    },
    include: {
      inquilino: {
        select: { id: true, nombre: true, apellidos: true, email: true, telefono: true },
      },
    },
  });

  if (!suHabitacion?.inquilino) {
    res.status(403).json({ error: 'No tienes acceso al perfil de este compañero.' });
    return;
  }

  res.status(200).json(suHabitacion.inquilino);
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

  const nuevoCodigo = await generarCodigoInvitacion();

  const habitacionActualizada = await prisma.habitacion.update({
    where: { codigo_invitacion },
    data: {
      inquilino_id: req.usuario!.id,
      codigo_invitacion: nuevoCodigo, // burn after reading: el código antiguo queda invalidado al instante
    },
    include: {
      vivienda: true,
      inquilino: { select: { nombre: true, apellidos: true } },
    },
  });

  res.status(200).json({
    mensaje: 'Te has unido a la habitación correctamente.',
    habitacion: serializarHabitacionParaInquilino(habitacionActualizada, req.usuario!.id),
  });

  // Notify casero async (fire-and-forget)
  const caseroId = habitacionActualizada.vivienda.casero_id;
  const nombre = habitacionActualizada.inquilino?.nombre ?? 'Un inquilino';
  const apellidos = habitacionActualizada.inquilino?.apellidos ?? '';
  const nombreCompleto = apellidos ? `${nombre} ${apellidos}` : nombre;
  enviarNotificacionPush(
    [caseroId],
    '👋 Nuevo inquilino',
    `${nombreCompleto} se ha unido a una de tus habitaciones.`,
  ).catch(console.error);
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
    vivienda: {
      ...habitacion.vivienda,
      habitaciones: habitacion.vivienda.habitaciones.map((h) =>
        serializarHabitacionParaInquilino(h, req.usuario!.id)
      ),
    },
  });
};
