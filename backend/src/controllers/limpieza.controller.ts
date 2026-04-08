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

export const eliminarZona: express.RequestHandler = async (req, res) => {
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

  // Eliminar registros dependientes antes de borrar la zona (sin cascade en schema).
  await prisma.$transaction([
    prisma.turnoLimpieza.deleteMany({ where: { zona_id: zonaId } }),
    prisma.asignacionLimpiezaFija.deleteMany({ where: { zona_id: zonaId } }),
    prisma.zonaLimpieza.delete({ where: { id: zonaId } }),
  ]);

  res.status(204).send();
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

export const obtenerTurnos: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);
  const usuarioId = req.usuario!.id;

  // Autorización: casero de la vivienda O inquilino con habitación en ella
  const esCasero = await verificarPropiedadVivienda(viviendaId, usuarioId);
  if (!esCasero) {
    const habitacion = await prisma.habitacion.findFirst({
      where: { vivienda_id: viviendaId, inquilino_id: usuarioId },
    });
    if (!habitacion) {
      res.status(403).json({ error: 'No tienes acceso a esta vivienda.' });
      return;
    }
  }

  // Semana objetivo: usa ?fecha=YYYY-MM-DD si se envía, si no la semana actual.
  const base = req.query['fecha'] ? new Date(req.query['fecha'] as string) : new Date();
  const offset = (base.getDay() + 6) % 7;
  const lunes = new Date(base);
  lunes.setDate(base.getDate() - offset);
  lunes.setHours(0, 0, 0, 0);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  domingo.setHours(23, 59, 59, 999);

  const turnos = await prisma.turnoLimpieza.findMany({
    where: {
      zona: { vivienda_id: viviendaId },
      fecha_inicio: { gte: lunes },
      fecha_fin: { lte: domingo },
    },
    include: {
      zona: { select: { id: true, nombre: true, peso: true } },
      usuario: { select: { id: true, nombre: true, apellidos: true } },
    },
    orderBy: [{ usuario_id: 'asc' }, { zona: { peso: 'desc' } }],
  });

  res.json(turnos);
};

export const marcarTurnoHecho: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);
  const turnoId = parseInt(req.params['turnoId'] as string, 10);
  const usuarioId = req.usuario!.id;

  const turno = await prisma.turnoLimpieza.findFirst({
    where: { id: turnoId, zona: { vivienda_id: viviendaId } },
  });

  if (!turno) {
    res.status(404).json({ error: 'Turno no encontrado.' });
    return;
  }

  // Autorización: el propio asignado o el casero de la vivienda
  if (turno.usuario_id !== usuarioId) {
    const esCasero = await verificarPropiedadVivienda(viviendaId, usuarioId);
    if (!esCasero) {
      res.status(403).json({ error: 'Solo puedes marcar tus propios turnos.' });
      return;
    }
  }

  const turnoActualizado = await prisma.turnoLimpieza.update({
    where: { id: turnoId },
    data: { estado: 'HECHO' },
    include: {
      zona: { select: { id: true, nombre: true, peso: true } },
      usuario: { select: { id: true, nombre: true, apellidos: true } },
    },
  });

  res.json(turnoActualizado);
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
