import express from 'express';
import { prisma } from '../lib/prisma';
import { generarTurnosSemanales } from '../services/limpieza.service';

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
  const { usuario_ids } = req.body as { usuario_ids: number[] };

  if (!Array.isArray(usuario_ids)) {
    res.status(400).json({ error: 'usuario_ids debe ser un array de números.' });
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

  if (usuario_ids.length > 0) {
    const habitaciones = await prisma.habitacion.findMany({
      where: { vivienda_id: viviendaId, inquilino_id: { in: usuario_ids } },
      select: { inquilino_id: true },
    });
    const validos = new Set(habitaciones.map((h) => h.inquilino_id));
    const invalidos = usuario_ids.filter((uid) => !validos.has(uid));
    if (invalidos.length > 0) {
      res.status(403).json({ error: 'Uno o más usuarios no son inquilinos de esta vivienda.' });
      return;
    }
  }

  // Sincronización atómica: eliminar todas las asignaciones actuales y crear las nuevas.
  const asignaciones = await prisma.$transaction(async (tx) => {
    await tx.asignacionLimpiezaFija.deleteMany({ where: { zona_id: zonaId } });
    if (usuario_ids.length === 0) return [];
    await tx.asignacionLimpiezaFija.createMany({
      data: usuario_ids.map((uid) => ({ zona_id: zonaId, usuario_id: uid })),
    });
    return tx.asignacionLimpiezaFija.findMany({
      where: { zona_id: zonaId },
      include: { usuario: { select: { id: true, nombre: true, apellidos: true } } },
    });
  });

  res.status(200).json(asignaciones);
};

export const quitarAsignacionFija: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);
  const zonaId = parseInt(req.params['zonaId'] as string, 10);

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

  const asignacion = await prisma.asignacionLimpiezaFija.findFirst({ where: { zona_id: zonaId } });
  if (!asignacion) {
    res.status(404).json({ error: 'Esta zona no tiene asignación fija.' });
    return;
  }

  await prisma.asignacionLimpiezaFija.delete({ where: { id: asignacion.id } });
  res.status(204).send();
};

export const generarTurnos: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);

  const vivienda = await verificarPropiedadVivienda(viviendaId, req.usuario!.id);
  if (!vivienda) {
    res.status(403).json({ error: 'No tienes permiso sobre esta vivienda.' });
    return;
  }

  try {
    await generarTurnosSemanales(viviendaId);
    res.status(201).json({ mensaje: 'Turnos de limpieza generados correctamente.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? 'No se pudieron generar los turnos.' });
  }
};
