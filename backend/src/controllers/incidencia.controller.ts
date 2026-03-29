import express from 'express';
import { prisma } from '../lib/prisma';
import { RolUsuario } from '../generated/prisma/client';

export const crearIncidencia: express.RequestHandler = async (req, res) => {
  const { titulo, descripcion, vivienda_id } = req.body as {
    titulo: string;
    descripcion: string;
    vivienda_id: number;
  };

  if (!titulo || !descripcion || !vivienda_id) {
    res.status(400).json({ error: 'Faltan campos obligatorios.' });
    return;
  }

  const usuarioId = req.usuario!.id;
  const rol = req.usuario!.rol;

  if (rol === RolUsuario.INQUILINO) {
    // Solo puede reportar si tiene una habitación asignada en esa vivienda concreta.
    const habitacion = await prisma.habitacion.findFirst({
      where: { vivienda_id, inquilino_id: usuarioId },
    });
    if (!habitacion) {
      res.status(403).json({ error: 'No tienes ninguna habitación asignada en esta vivienda.' });
      return;
    }
  } else {
    // CASERO: debe ser propietario de la vivienda.
    const vivienda = await prisma.vivienda.findUnique({ where: { id: vivienda_id } });
    if (!vivienda || vivienda.casero_id !== usuarioId) {
      res.status(403).json({ error: 'Esta vivienda no te pertenece.' });
      return;
    }
  }

  const incidencia = await prisma.incidencia.create({
    data: { titulo, descripcion, vivienda_id, creador_id: usuarioId },
  });

  res.status(201).json(incidencia);
};
