import express from 'express';
import { prisma } from '../lib/prisma';
import { RolUsuario, EstadoIncidencia, PrioridadIncidencia } from '../generated/prisma/client';
import { enviarNotificacionPush } from '../services/notification.service';

const PRIORIDADES_VALIDAS = Object.values(PrioridadIncidencia);
const ESTADOS_VALIDOS = Object.values(EstadoIncidencia);

const LABEL_PRIORIDAD: Record<PrioridadIncidencia, string> = {
  VERDE:    'Verde',
  AMARILLO: 'Amarillo',
  ROJO:     'Rojo',
};

const LABEL_ESTADO: Record<EstadoIncidencia, string> = {
  PENDIENTE:  'Pendiente',
  EN_PROCESO: 'En proceso',
  RESUELTA:   'Resuelta',
};

export const crearIncidencia: express.RequestHandler = async (req, res) => {
  const {
    titulo,
    descripcion,
    prioridad,
    vivienda_id: viviendaIdBody,
    habitacion_id,
  } = req.body as {
    titulo: string;
    descripcion: string;
    prioridad?: PrioridadIncidencia;
    vivienda_id?: number;
    habitacion_id?: number;
  };

  if (!titulo || !descripcion) {
    res.status(400).json({ error: 'Faltan campos obligatorios.' });
    return;
  }

  if (prioridad && !PRIORIDADES_VALIDAS.includes(prioridad)) {
    res.status(400).json({ error: 'prioridad debe ser VERDE, AMARILLO o ROJO.' });
    return;
  }

  const usuarioId = req.usuario!.id;
  const rol = req.usuario!.rol;

  let vivienda_id: number;

  if (rol === RolUsuario.INQUILINO) {
    // Deriva la vivienda de la habitación asignada al inquilino
    const habitacionPropia = await prisma.habitacion.findFirst({
      where: { inquilino_id: usuarioId },
    });
    if (!habitacionPropia) {
      res.status(403).json({ error: 'No tienes ninguna habitación asignada.' });
      return;
    }
    vivienda_id = habitacionPropia.vivienda_id;

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
    // CASERO: vivienda_id obligatorio en el body
    if (!viviendaIdBody) {
      res.status(400).json({ error: 'vivienda_id es obligatorio.' });
      return;
    }
    vivienda_id = viviendaIdBody;

    const vivienda = await prisma.vivienda.findUnique({ where: { id: vivienda_id } });
    if (!vivienda || vivienda.casero_id !== usuarioId) {
      res.status(403).json({ error: 'Esta vivienda no te pertenece.' });
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
    include: {
      creador: { select: { nombre: true } },
      vivienda: { select: { casero_id: true } },
    },
  });

  // Notificar al casero solo si la prioridad es AMARILLO o ROJO
  if (incidencia.prioridad !== PrioridadIncidencia.VERDE) {
    const caseroId = incidencia.vivienda.casero_id;
    if (caseroId !== usuarioId) {
      enviarNotificacionPush(
        [caseroId],
        `🔧 ${LABEL_PRIORIDAD[incidencia.prioridad]} - Nueva incidencia`,
        `${incidencia.creador.nombre} ha reportado: ${incidencia.titulo}`,
      ).catch((err) => console.error('[push] Error notificando incidencia:', err));
    }
  }

  res.status(201).json(incidencia);
};

export const listarIncidencias: express.RequestHandler = async (req, res) => {
  const usuarioId = req.usuario!.id;
  const rol = req.usuario!.rol;

  if (rol === RolUsuario.CASERO) {
    const viviendaIdParam = req.query['viviendaId'] ? parseInt(req.query['viviendaId'] as string, 10) : undefined;
    const incidencias = await prisma.incidencia.findMany({
      where: {
        vivienda: { casero_id: usuarioId },
        ...(viviendaIdParam ? { vivienda_id: viviendaIdParam } : {}),
      },
      include: {
        vivienda: true,
        creador: { select: { id: true, nombre: true, apellidos: true } },
        habitacion: { select: { id: true, nombre: true } },
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

export const obtenerIncidencia: express.RequestHandler = async (req, res) => {
  const id = parseInt(req.params['id'] as string, 10);
  const usuarioId = req.usuario!.id;
  const rol = req.usuario!.rol;

  const incidencia = await prisma.incidencia.findUnique({
    where: { id },
    include: {
      vivienda: true,
      creador: { select: { id: true, nombre: true, apellidos: true } },
      habitacion: { select: { id: true, nombre: true, tipo: true } },
    },
  });

  if (!incidencia) {
    res.status(404).json({ error: 'Incidencia no encontrada.' });
    return;
  }

  let puedeEditar = false;
  let puedeEliminar = false;
  let puedeCambiarEstado = false;

  if (rol === RolUsuario.CASERO) {
    if (incidencia.vivienda.casero_id !== usuarioId) {
      res.status(403).json({ error: 'No tienes permiso para ver esta incidencia.' });
      return;
    }

    puedeEditar = true;
    puedeEliminar = true;
    puedeCambiarEstado = true;
  } else {
    const miHabitacion = await prisma.habitacion.findFirst({
      where: { vivienda_id: incidencia.vivienda_id, inquilino_id: usuarioId },
    });
    if (!miHabitacion) {
      res.status(403).json({ error: 'No tienes acceso a esta incidencia.' });
      return;
    }

    const esCreador = incidencia.creador_id === usuarioId;
    const esSuDormitorio =
      incidencia.habitacion_id !== null && incidencia.habitacion_id === miHabitacion.id;
    const esZonaComun =
      incidencia.habitacion !== null && incidencia.habitacion.tipo !== 'DORMITORIO';

    puedeEditar = esCreador;
    puedeEliminar = esCreador;
    puedeCambiarEstado = esCreador || esSuDormitorio || esZonaComun;
  }

  res.status(200).json({
    ...incidencia,
    permisos: {
      puedeEditar,
      puedeEliminar,
      puedeCambiarEstado,
    },
  });
};

export const editarIncidencia: express.RequestHandler = async (req, res) => {
  const id = parseInt(req.params['id'] as string, 10);
  const { titulo, descripcion } = req.body as { titulo?: string; descripcion?: string };
  const usuarioId = req.usuario!.id;
  const rol = req.usuario!.rol;

  const incidencia = await prisma.incidencia.findUnique({
    where: { id },
    include: { vivienda: true },
  });

  if (!incidencia) {
    res.status(404).json({ error: 'Incidencia no encontrada.' });
    return;
  }

  if (rol === RolUsuario.CASERO) {
    if (incidencia.vivienda.casero_id !== usuarioId) {
      res.status(403).json({ error: 'No tienes permiso para editar esta incidencia.' });
      return;
    }
  } else {
    if (incidencia.creador_id !== usuarioId) {
      res.status(403).json({ error: 'Solo el creador puede editar esta incidencia.' });
      return;
    }
  }

  const actualizada = await prisma.incidencia.update({
    where: { id },
    data: {
      ...(titulo ? { titulo } : {}),
      ...(descripcion ? { descripcion } : {}),
    },
  });

  res.status(200).json(actualizada);
};

export const eliminarIncidencia: express.RequestHandler = async (req, res) => {
  const id = parseInt(req.params['id'] as string, 10);
  const usuarioId = req.usuario!.id;
  const rol = req.usuario!.rol;

  const incidencia = await prisma.incidencia.findUnique({
    where: { id },
    include: { vivienda: true },
  });

  if (!incidencia) {
    res.status(404).json({ error: 'Incidencia no encontrada.' });
    return;
  }

  if (rol === RolUsuario.CASERO) {
    if (incidencia.vivienda.casero_id !== usuarioId) {
      res.status(403).json({ error: 'No tienes permiso para eliminar esta incidencia.' });
      return;
    }
  } else {
    if (incidencia.creador_id !== usuarioId) {
      res.status(403).json({ error: 'Solo el creador puede eliminar esta incidencia.' });
      return;
    }
  }

  await prisma.incidencia.delete({ where: { id } });
  res.status(204).send();
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
    include: { vivienda: true, habitacion: true },
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
    // INQUILINO: debe tener habitación en esta vivienda
    const miHabitacion = await prisma.habitacion.findFirst({
      where: { vivienda_id: incidencia.vivienda_id, inquilino_id: usuarioId },
    });
    if (!miHabitacion) {
      res.status(403).json({ error: 'No tienes ninguna habitación en esta vivienda.' });
      return;
    }

    // Al menos una condición debe cumplirse:
    // a) es el creador original
    // b) la incidencia está vinculada a su propio dormitorio
    // c) la incidencia está vinculada a una zona común
    const esCreador      = incidencia.creador_id === usuarioId;
    const esSuDormitorio = incidencia.habitacion_id !== null && incidencia.habitacion_id === miHabitacion.id;
    const esZonaComun    = incidencia.habitacion !== null && incidencia.habitacion.tipo !== 'DORMITORIO';

    if (!esCreador && !esSuDormitorio && !esZonaComun) {
      res.status(403).json({ error: 'No tienes permiso para modificar esta incidencia.' });
      return;
    }
  }

  const incidenciaActualizada = await prisma.incidencia.update({
    where: { id },
    data: { estado },
  });

  // Notificar al creador si no es quien está cambiando el estado
  if (incidencia.creador_id !== usuarioId) {
    enviarNotificacionPush(
      [incidencia.creador_id],
      '🛠️ Incidencia actualizada',
      `El estado de "${incidencia.titulo}" ha cambiado a: ${LABEL_ESTADO[estado]}`,
    ).catch((err) => console.error('[push] Error notificando cambio de estado:', err));
  }

  res.status(200).json(incidenciaActualizada);
};
