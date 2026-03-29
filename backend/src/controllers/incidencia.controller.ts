import express from 'express';
import { prisma } from '../lib/prisma';
import { RolUsuario, PrioridadIncidencia } from '../generated/prisma/client';

const PRIORIDADES_VALIDAS = Object.values(PrioridadIncidencia);

export const crearIncidencia: express.RequestHandler = async (req, res) => {
  const { titulo, descripcion, vivienda_id, prioridad } = req.body as {
    titulo: string;
    descripcion: string;
    vivienda_id: number;
    prioridad?: PrioridadIncidencia;
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
    const habitacion = await prisma.habitacion.findFirst({
      where: { vivienda_id, inquilino_id: usuarioId },
    });
    if (!habitacion) {
      res.status(403).json({ error: 'No tienes ninguna habitación asignada en esta vivienda.' });
      return;
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
