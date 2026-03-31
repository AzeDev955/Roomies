import express from 'express';
import { prisma } from '../lib/prisma';
import { RolUsuario, EstadoIncidencia, PrioridadIncidencia } from '../generated/prisma/client';

const PRIORIDADES_VALIDAS = Object.values(PrioridadIncidencia);
const ESTADOS_VALIDOS = Object.values(EstadoIncidencia);

export const crearIncidencia: express.RequestHandler = async (req, res) => {
  const { titulo, descripcion, vivienda_id, prioridad, habitacion_id } = req.body as {
    titulo: string;
    descripcion: string;
    vivienda_id: number;
    prioridad?: PrioridadIncidencia;
    habitacion_id?: number;
  };

  if (!titulo || !descripcion || !vivienda_id) {
    res.status(400).json({ error: 'Faltan campos obligatorios.' });
    return;
  }

  if (prioridad && !PRIORIDADES_VALIDAS.includes(prioridad)) {
    res.status(400).json({ error: 'prioridad debe ser VERDE, AMARILLO o ROJO.' });
    return;
  }

  const usuarioId = req.usuario!.id;
  const rol = req.usuario!.rol;

  if (rol === RolUsuario.INQUILINO) {
    const habitacionPropia = await prisma.habitacion.findFirst({
      where: { vivienda_id, inquilino_id: usuarioId },
    });
    if (!habitacionPropia) {
      res.status(403).json({ error: 'No tienes ninguna habitación asignada en esta vivienda.' });
      return;
    }

    if (habitacion_id) {
      const hab = await prisma.habitacion.findFirst({
        where: { id: habitacion_id, vivienda_id },
      });
      if (!hab) {
        res.status(400).json({ error: 'Habitación no encontrada en esta vivienda.' });
        return;
      }
      if (hab.tipo === 'DORMITORIO' && hab.inquilino_id !== usuarioId) {
        res.status(403).json({ error: 'No puedes reportar incidencias en el dormitorio de otro inquilino.' });
        return;
      }
    }
  } else {
    const vivienda = await prisma.vivienda.findUnique({ where: { id: vivienda_id } });
    if (!vivienda || vivienda.casero_id !== usuarioId) {
      res.status(403).json({ error: 'Esta vivienda no te pertenece.' });
      return;
    }
  }

  const incidencia = await prisma.incidencia.create({
    data: {
      titulo,
      descripcion,
      vivienda_id,
      creador_id: usuarioId,
      prioridad: prioridad ?? PrioridadIncidencia.VERDE,
      ...(habitacion_id ? { habitacion_id } : {}),
    },
  });

  res.status(201).json(incidencia);
};

export const listarIncidencias: express.RequestHandler = async (req, res) => {
  const usuarioId = req.usuario!.id;
  const rol = req.usuario!.rol;

  if (rol === RolUsuario.CASERO) {
    const incidencias = await prisma.incidencia.findMany({
      where: { vivienda: { casero_id: usuarioId } },
      include: {
        vivienda: true,
        creador: { select: { id: true, nombre: true, apellidos: true } },
      },
      orderBy: { fecha_creacion: 'desc' },
    });
    res.status(200).json(incidencias);
    return;
  }

  // INQUILINO: solo ve las incidencias de la vivienda donde tiene habitación asignada.
  const habitacion = await prisma.habitacion.findFirst({
    where: { inquilino_id: usuarioId },
  });

  if (!habitacion) {
    res.status(200).json([]);
    return;
  }

  const incidencias = await prisma.incidencia.findMany({
    where: { vivienda_id: habitacion.vivienda_id },
    include: {
      vivienda: true,
      creador: { select: { id: true, nombre: true, apellidos: true } },
    },
    orderBy: { fecha_creacion: 'desc' },
  });

  res.status(200).json(incidencias);
};

export const actualizarEstadoIncidencia: express.RequestHandler = async (req, res) => {
  const id = parseInt(req.params['id'] as string, 10);
  const { estado } = req.body as { estado: EstadoIncidencia };

  if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
    res.status(400).json({ error: 'estado debe ser PENDIENTE, EN_PROCESO o RESUELTA.' });
    return;
  }

  const incidencia = await prisma.incidencia.findUnique({
    where: { id },
    include: { vivienda: true },
  });

  if (!incidencia) {
    res.status(404).json({ error: 'Incidencia no encontrada.' });
    return;
  }

  const usuarioId = req.usuario!.id;
  const rol = req.usuario!.rol;

  if (rol === RolUsuario.CASERO) {
    if (incidencia.vivienda.casero_id !== usuarioId) {
      res.status(403).json({ error: 'No tienes permiso para modificar esta incidencia.' });
      return;
    }
  } else {
    // INQUILINO: debe tener habitación en la misma vivienda
    const habitacion = await prisma.habitacion.findFirst({
      where: { vivienda_id: incidencia.vivienda_id, inquilino_id: usuarioId },
    });
    if (!habitacion) {
      res.status(403).json({ error: 'No tienes permiso para modificar esta incidencia.' });
      return;
    }
  }

  const incidenciaActualizada = await prisma.incidencia.update({
    where: { id },
    data: { estado },
  });

  res.status(200).json(incidenciaActualizada);
};
