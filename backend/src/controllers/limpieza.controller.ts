import express from 'express';
import { prisma } from '../lib/prisma';

const verificarPropiedadVivienda = async (viviendaId: number, caseroId: number) => {
  const vivienda = await prisma.vivienda.findUnique({ where: { id: viviendaId } });
  if (!vivienda || vivienda.casero_id !== caseroId) return null;
  return vivienda;
};

export const crearZona: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);
  const { nombre, peso } = req.body as { nombre: string; peso: number };

  if (!nombre || peso === undefined || peso === null) {
    res.status(400).json({ error: 'nombre y peso son obligatorios.' });
    return;
  }
  if (typeof peso !== 'number' || peso <= 0) {
    res.status(400).json({ error: 'peso debe ser un número positivo.' });
    return;
  }

  const vivienda = await verificarPropiedadVivienda(viviendaId, req.usuario!.id);
  if (!vivienda) {
    res.status(403).json({ error: 'No tienes permiso sobre esta vivienda.' });
    return;
  }

  const zona = await prisma.zonaLimpieza.create({
    data: { vivienda_id: viviendaId, nombre, peso },
  });

  res.status(201).json(zona);
};

export const listarZonas: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);

  const vivienda = await verificarPropiedadVivienda(viviendaId, req.usuario!.id);
  if (!vivienda) {
    res.status(403).json({ error: 'No tienes permiso sobre esta vivienda.' });
    return;
  }

  const zonas = await prisma.zonaLimpieza.findMany({
    where: { vivienda_id: viviendaId },
    include: {
      asignaciones_fijas: {
        include: {
          usuario: { select: { id: true, nombre: true, apellidos: true } },
        },
      },
    },
    orderBy: { id: 'asc' },
  });

  res.status(200).json(zonas);
};

export const actualizarZona: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);
  const zonaId = parseInt(req.params['zonaId'] as string, 10);
  const { nombre, peso, activa } = req.body as { nombre?: string; peso?: number; activa?: boolean };

  const vivienda = await verificarPropiedadVivienda(viviendaId, req.usuario!.id);
  if (!vivienda) {
    res.status(403).json({ error: 'No tienes permiso sobre esta vivienda.' });
    return;
  }

  const zona = await prisma.zonaLimpieza.findFirst({ where: { id: zonaId, vivienda_id: viviendaId } });
  if (!zona) {
    res.status(404).json({ error: 'Zona no encontrada.' });
    return;
  }

  if (peso !== undefined && (typeof peso !== 'number' || peso <= 0)) {
    res.status(400).json({ error: 'peso debe ser un número positivo.' });
    return;
  }

  const zonaActualizada = await prisma.zonaLimpieza.update({
    where: { id: zonaId },
    data: {
      nombre: nombre ?? zona.nombre,
      peso: peso ?? zona.peso,
      activa: activa !== undefined ? activa : zona.activa,
    },
  });

  res.status(200).json(zonaActualizada);
};

export const asignarZonaFija: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);
  const zonaId = parseInt(req.params['zonaId'] as string, 10);
  const { usuario_id } = req.body as { usuario_id: number };

  if (!usuario_id) {
    res.status(400).json({ error: 'usuario_id es obligatorio.' });
    return;
  }

  const vivienda = await verificarPropiedadVivienda(viviendaId, req.usuario!.id);
  if (!vivienda) {
    res.status(403).json({ error: 'No tienes permiso sobre esta vivienda.' });
    return;
  }

  const zona = await prisma.zonaLimpieza.findFirst({ where: { id: zonaId, vivienda_id: viviendaId } });
  if (!zona) {
    res.status(404).json({ error: 'Zona no encontrada.' });
    return;
  }

  const habitacion = await prisma.habitacion.findFirst({
    where: { vivienda_id: viviendaId, inquilino_id: usuario_id },
  });
  if (!habitacion) {
    res.status(403).json({ error: 'El usuario no es inquilino de esta vivienda.' });
    return;
  }

  const asignacion = await prisma.asignacionLimpiezaFija.upsert({
    where: { zona_id_usuario_id: { zona_id: zonaId, usuario_id } },
    create: { zona_id: zonaId, usuario_id },
    update: {},
    include: {
      usuario: { select: { id: true, nombre: true, apellidos: true } },
      zona: true,
    },
  });

  res.status(200).json(asignacion);
};
