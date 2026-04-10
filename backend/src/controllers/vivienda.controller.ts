import express from 'express';
import { prisma } from '../lib/prisma';
import { RolUsuario, TipoHabitacion, EstadoIncidencia } from '../generated/prisma/client';
import { generarCodigoInvitacion } from '../utils/generarCodigo';

export const listarViviendas: express.RequestHandler = async (req, res) => {
  const viviendas = await prisma.vivienda.findMany({
    where: { casero_id: req.usuario!.id },
    include: {
      habitaciones: true,
      incidencias: {
        where: {
          estado: { in: [EstadoIncidencia.PENDIENTE, EstadoIncidencia.EN_PROCESO] },
        },
        select: { prioridad: true },
      },
    },
  });
  res.status(200).json(viviendas);
};

export const crearVivienda: express.RequestHandler = async (req, res) => {
  if (req.usuario!.rol !== RolUsuario.CASERO) {
    res.status(403).json({ error: 'Solo los caseros pueden crear viviendas.' });
    return;
  }

  const { alias_nombre, direccion, codigo_postal, ciudad, provincia, habitaciones } = req.body as {
    alias_nombre: string;
    direccion: string;
    codigo_postal: string;
    ciudad: string;
    provincia: string;
    habitaciones?: {
      nombre: string;
      tipo?: TipoHabitacion;
      es_habitable?: boolean;
      metros_cuadrados?: number;
    }[];
  };

  if (!alias_nombre || !direccion || !codigo_postal || !ciudad || !provincia) {
    res.status(400).json({ error: 'alias_nombre, direccion, codigo_postal, ciudad y provincia son obligatorios.' });
    return;
  }

  const habitacionesData = await Promise.all(
    (habitaciones ?? []).map(async (h) => {
      const habitable = h.es_habitable !== false;
      return {
        nombre: h.nombre,
        tipo: h.tipo ?? TipoHabitacion.DORMITORIO,
        es_habitable: habitable,
        metros_cuadrados: h.metros_cuadrados ?? null,
        codigo_invitacion: habitable ? await generarCodigoInvitacion() : null,
      };
    })
  );

  const vivienda = await prisma.vivienda.create({
    data: {
      casero_id: req.usuario!.id,
      alias_nombre,
      direccion,
      codigo_postal,
      ciudad,
      provincia,
      habitaciones: habitacionesData.length > 0 ? { create: habitacionesData } : undefined,
    },
    include: { habitaciones: true },
  });

  res.status(201).json(vivienda);
};

export const obtenerVivienda: express.RequestHandler = async (req, res) => {
  const id = parseInt(req.params['id'] as string, 10);
  const vivienda = await prisma.vivienda.findUnique({
    where: { id },
    include: {
      habitaciones: {
        include: {
          inquilino: {
            select: { id: true, nombre: true, apellidos: true, email: true },
          },
          incidencias: {
            where: { estado: { in: [EstadoIncidencia.PENDIENTE, EstadoIncidencia.EN_PROCESO] } },
            select: { id: true, titulo: true, prioridad: true, estado: true },
          },
        },
      },
    },
  });
  if (!vivienda || vivienda.casero_id !== req.usuario!.id) {
    res.status(404).json({ error: 'Vivienda no encontrada.' });
    return;
  }
  res.status(200).json(vivienda);
};

export const actualizarVivienda: express.RequestHandler = async (req, res) => {
  const id = parseInt(req.params['id'] as string, 10);
  const { mod_limpieza, mod_gastos, mod_inventario } = req.body as {
    mod_limpieza?: unknown;
    mod_gastos?: unknown;
    mod_inventario?: unknown;
  };

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'ID de vivienda invalido.' });
    return;
  }

  if (req.usuario!.rol !== RolUsuario.CASERO) {
    res.status(403).json({ error: 'Solo el casero puede configurar los modulos de una vivienda.' });
    return;
  }

  const vivienda = await prisma.vivienda.findUnique({ where: { id } });
  if (!vivienda || vivienda.casero_id !== req.usuario!.id) {
    res.status(404).json({ error: 'Vivienda no encontrada.' });
    return;
  }

  const data: {
    mod_limpieza?: boolean;
    mod_gastos?: boolean;
    mod_inventario?: boolean;
  } = {};

  if (mod_limpieza !== undefined) {
    if (typeof mod_limpieza !== 'boolean') {
      res.status(400).json({ error: 'mod_limpieza debe ser booleano.' });
      return;
    }
    data.mod_limpieza = mod_limpieza;
  }

  if (mod_gastos !== undefined) {
    if (typeof mod_gastos !== 'boolean') {
      res.status(400).json({ error: 'mod_gastos debe ser booleano.' });
      return;
    }
    data.mod_gastos = mod_gastos;
  }

  if (mod_inventario !== undefined) {
    if (typeof mod_inventario !== 'boolean') {
      res.status(400).json({ error: 'mod_inventario debe ser booleano.' });
      return;
    }
    data.mod_inventario = mod_inventario;
  }

  if (Object.keys(data).length === 0) {
    res.status(400).json({ error: 'No hay modulos para actualizar.' });
    return;
  }

  const viviendaActualizada = await prisma.vivienda.update({
    where: { id },
    data,
    include: {
      habitaciones: {
        include: {
          inquilino: {
            select: { id: true, nombre: true, apellidos: true, email: true },
          },
          incidencias: {
            where: { estado: { in: [EstadoIncidencia.PENDIENTE, EstadoIncidencia.EN_PROCESO] } },
            select: { id: true, titulo: true, prioridad: true, estado: true },
          },
        },
      },
    },
  });

  res.status(200).json(viviendaActualizada);
};

export const crearHabitacion: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);

  const { nombre, tipo, es_habitable, metros_cuadrados } = req.body as {
    nombre: string;
    tipo?: TipoHabitacion;
    es_habitable?: boolean;
    metros_cuadrados?: number;
  };

  if (!nombre) {
    res.status(400).json({ error: 'nombre es obligatorio.' });
    return;
  }

  const vivienda = await prisma.vivienda.findUnique({ where: { id: viviendaId } });
  if (!vivienda || vivienda.casero_id !== req.usuario!.id) {
    res.status(403).json({ error: 'No tienes permiso para añadir habitaciones a esta vivienda.' });
    return;
  }

  const habitable = es_habitable !== false;
  const codigo_invitacion = habitable ? await generarCodigoInvitacion() : null;

  const habitacion = await prisma.habitacion.create({
    data: {
      vivienda_id: viviendaId,
      nombre,
      tipo: tipo ?? TipoHabitacion.DORMITORIO,
      es_habitable: habitable,
      metros_cuadrados: metros_cuadrados ?? null,
      codigo_invitacion,
    },
  });

  res.status(201).json(habitacion);
};

export const editarHabitacion: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);
  const habId = parseInt(req.params['habId'] as string, 10);

  const { nombre, tipo, es_habitable, metros_cuadrados } = req.body as {
    nombre?: string;
    tipo?: TipoHabitacion;
    es_habitable?: boolean;
    metros_cuadrados?: number | null;
  };

  const vivienda = await prisma.vivienda.findUnique({ where: { id: viviendaId } });
  if (!vivienda || vivienda.casero_id !== req.usuario!.id) {
    res.status(403).json({ error: 'No tienes permiso para editar habitaciones de esta vivienda.' });
    return;
  }

  const habitacionActual = await prisma.habitacion.findFirst({
    where: { id: habId, vivienda_id: viviendaId },
  });
  if (!habitacionActual) {
    res.status(404).json({ error: 'Habitación no encontrada.' });
    return;
  }

  let codigo_invitacion = habitacionActual.codigo_invitacion;
  if (es_habitable !== undefined && es_habitable !== habitacionActual.es_habitable) {
    if (es_habitable) {
      codigo_invitacion = await generarCodigoInvitacion();
    } else {
      codigo_invitacion = null;
    }
  }

  const habitacion = await prisma.habitacion.update({
    where: { id: habId },
    data: {
      nombre: nombre ?? habitacionActual.nombre,
      tipo: tipo ?? habitacionActual.tipo,
      es_habitable: es_habitable ?? habitacionActual.es_habitable,
      metros_cuadrados: metros_cuadrados !== undefined ? metros_cuadrados : habitacionActual.metros_cuadrados,
      codigo_invitacion,
    },
  });

  res.status(200).json(habitacion);
};

export const expulsarInquilino: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);
  const habId = parseInt(req.params['habId'] as string, 10);

  const vivienda = await prisma.vivienda.findUnique({ where: { id: viviendaId } });
  if (!vivienda || vivienda.casero_id !== req.usuario!.id) {
    res.status(403).json({ error: 'Esta vivienda no te pertenece.' });
    return;
  }

  const habitacion = await prisma.habitacion.findFirst({
    where: { id: habId, vivienda_id: viviendaId },
  });
  if (!habitacion) {
    res.status(404).json({ error: 'Habitación no encontrada.' });
    return;
  }
  if (habitacion.inquilino_id === null) {
    res.status(400).json({ error: 'Esta habitación no tiene inquilino asignado.' });
    return;
  }

  await prisma.habitacion.update({
    where: { id: habId },
    data: { inquilino_id: null },
  });

  res.status(200).json({ mensaje: 'Inquilino desvinculado correctamente.' });
};

export const eliminarHabitacion: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);
  const habId = parseInt(req.params['habId'] as string, 10);

  const vivienda = await prisma.vivienda.findUnique({ where: { id: viviendaId } });
  if (!vivienda || vivienda.casero_id !== req.usuario!.id) {
    res.status(403).json({ error: 'No tienes permiso para eliminar habitaciones de esta vivienda.' });
    return;
  }

  const habitacion = await prisma.habitacion.findFirst({
    where: { id: habId, vivienda_id: viviendaId },
  });
  if (!habitacion) {
    res.status(404).json({ error: 'Habitación no encontrada.' });
    return;
  }

  if (habitacion.inquilino_id !== null) {
    res.status(400).json({ error: 'No se puede eliminar una habitación con inquilino asignado.' });
    return;
  }

  await prisma.habitacion.delete({ where: { id: habId } });
  res.status(204).send();
};
