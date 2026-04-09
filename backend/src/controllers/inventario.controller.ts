import express from 'express';
import { cloudinaryEstaConfigurado } from '../config/cloudinary.config';
import { EstadoItem, RolUsuario } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';

const ESTADOS_ITEM_VALIDOS = new Set<EstadoItem>([
  EstadoItem.NUEVO,
  EstadoItem.BUENO,
  EstadoItem.DESGASTADO,
  EstadoItem.ROTO,
]);

const usuarioTieneAccesoAVivienda = async (
  usuarioId: number,
  rol: RolUsuario,
  viviendaId: number,
) => {
  if (rol === RolUsuario.CASERO) {
    const vivienda = await prisma.vivienda.findFirst({
      where: { id: viviendaId, casero_id: usuarioId },
      select: { id: true },
    });

    return vivienda !== null;
  }

  const habitacion = await prisma.habitacion.findFirst({
    where: { vivienda_id: viviendaId, inquilino_id: usuarioId },
    select: { id: true },
  });

  return habitacion !== null;
};

const obtenerViviendaDelCasero = async (usuarioId: number, viviendaId: number) =>
  prisma.vivienda.findFirst({
    where: {
      id: viviendaId,
      casero_id: usuarioId,
    },
    select: {
      id: true,
      alias_nombre: true,
      habitaciones: {
        select: {
          id: true,
          nombre: true,
          tipo: true,
        },
        orderBy: {
          nombre: 'asc',
        },
      },
    },
  });

export const crearItemInventario: express.RequestHandler = async (req, res) => {
  const viviendaId = Number(req.params['viviendaId']);
  const usuarioId = req.usuario!.id;
  const rol = req.usuario!.rol;
  const {
    nombre,
    descripcion,
    estado,
    habitacion_id: habitacionIdRaw,
    vivienda_id: viviendaIdBodyRaw,
  } = req.body as {
    nombre?: unknown;
    descripcion?: unknown;
    estado?: unknown;
    habitacion_id?: unknown;
    vivienda_id?: unknown;
  };

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId inválido.' });
    return;
  }

  if (rol !== RolUsuario.CASERO) {
    res.status(403).json({ error: 'Solo el casero puede registrar items de inventario.' });
    return;
  }

  const vivienda = await obtenerViviendaDelCasero(usuarioId, viviendaId);
  if (!vivienda) {
    res.status(403).json({ error: 'No tienes permiso para gestionar el inventario de esta vivienda.' });
    return;
  }

  const nombreLimpio = typeof nombre === 'string' ? nombre.trim() : '';
  const descripcionLimpia =
    typeof descripcion === 'string' && descripcion.trim().length > 0
      ? descripcion.trim()
      : null;

  if (!nombreLimpio) {
    res.status(400).json({ error: 'El nombre del item es obligatorio.' });
    return;
  }

  const estadoNormalizado =
    typeof estado === 'string' ? estado.trim().toUpperCase() as EstadoItem : EstadoItem.BUENO;

  if (!ESTADOS_ITEM_VALIDOS.has(estadoNormalizado)) {
    res.status(400).json({ error: 'El estado del item no es válido.' });
    return;
  }

  const habitacionId =
    habitacionIdRaw === null || habitacionIdRaw === undefined || habitacionIdRaw === ''
      ? null
      : Number(habitacionIdRaw);
  const viviendaIdBody =
    viviendaIdBodyRaw === null || viviendaIdBodyRaw === undefined || viviendaIdBodyRaw === ''
      ? null
      : Number(viviendaIdBodyRaw);

  const tieneHabitacion = habitacionId !== null;
  const tieneVivienda = viviendaIdBody !== null;

  if (tieneHabitacion === tieneVivienda) {
    res.status(400).json({
      error: 'Debes indicar habitacion_id o vivienda_id, pero no ambos.',
    });
    return;
  }

  if (tieneVivienda && viviendaIdBody !== viviendaId) {
    res.status(400).json({
      error: 'vivienda_id debe coincidir con la vivienda indicada en la ruta.',
    });
    return;
  }

  if (tieneHabitacion && (!Number.isInteger(habitacionId) || habitacionId <= 0)) {
    res.status(400).json({ error: 'habitacion_id inválido.' });
    return;
  }

  if (tieneVivienda && (!Number.isInteger(viviendaIdBody) || viviendaIdBody <= 0)) {
    res.status(400).json({ error: 'vivienda_id inválido.' });
    return;
  }

  if (habitacionId !== null) {
    const habitacionPerteneceAVivienda = vivienda.habitaciones.some(
      (habitacion) => habitacion.id === habitacionId,
    );

    if (!habitacionPerteneceAVivienda) {
      res.status(400).json({ error: 'La habitación no pertenece a esta vivienda.' });
      return;
    }
  }

  const item = await prisma.itemInventario.create({
    data: {
      nombre: nombreLimpio,
      descripcion: descripcionLimpia,
      estado: estadoNormalizado,
      habitacion_id: habitacionId,
      vivienda_id: viviendaIdBody,
    },
    include: {
      habitacion: {
        select: {
          id: true,
          nombre: true,
          tipo: true,
        },
      },
      fotos: {
        orderBy: {
          fecha_subida: 'desc',
        },
      },
    },
  });

  res.status(201).json(item);
};

export const listarInventarioVivienda: express.RequestHandler = async (req, res) => {
  const viviendaId = Number(req.params['viviendaId']);
  const usuarioId = req.usuario!.id;
  const rol = req.usuario!.rol;

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId inválido.' });
    return;
  }

  const tieneAcceso = await usuarioTieneAccesoAVivienda(usuarioId, rol, viviendaId);
  if (!tieneAcceso) {
    res.status(403).json({ error: 'No tienes acceso al inventario de esta vivienda.' });
    return;
  }

  const items = await prisma.itemInventario.findMany({
    where: {
      OR: [
        { vivienda_id: viviendaId },
        { habitacion: { vivienda_id: viviendaId } },
      ],
    },
    include: {
      habitacion: {
        select: {
          id: true,
          nombre: true,
          tipo: true,
        },
      },
      fotos: {
        orderBy: {
          fecha_subida: 'desc',
        },
      },
    },
    orderBy: [
      { habitacion_id: 'asc' },
      { nombre: 'asc' },
      { fecha_registro: 'desc' },
    ],
  });

  res.status(200).json(items);
};

export const subirFotoInventario: express.RequestHandler = async (req, res) => {
  const itemId = Number(req.params['itemId']);
  const usuarioId = req.usuario!.id;
  const rol = req.usuario!.rol;

  if (!cloudinaryEstaConfigurado) {
    res.status(500).json({ error: 'Cloudinary no está configurado en el servidor.' });
    return;
  }

  if (!Number.isInteger(itemId) || itemId <= 0) {
    res.status(400).json({ error: 'itemId inválido.' });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: 'Debes adjuntar una imagen.' });
    return;
  }

  const item = await prisma.itemInventario.findUnique({
    where: { id: itemId },
    include: {
      habitacion: {
        select: {
          vivienda_id: true,
        },
      },
      vivienda: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!item) {
    res.status(404).json({ error: 'Item de inventario no encontrado.' });
    return;
  }

  const viviendaId = item.vivienda_id ?? item.habitacion?.vivienda_id;

  if (!viviendaId) {
    res.status(400).json({ error: 'El item de inventario no está vinculado a una vivienda válida.' });
    return;
  }

  const tieneAcceso = await usuarioTieneAccesoAVivienda(usuarioId, rol, viviendaId);
  if (!tieneAcceso) {
    res.status(403).json({ error: 'No tienes permiso para subir fotos a este item.' });
    return;
  }

  const secureUrl = (req.file as Express.Multer.File & { path?: string }).path;
  if (!secureUrl) {
    res.status(500).json({ error: 'No se pudo obtener la URL de la imagen subida.' });
    return;
  }

  const asset = await prisma.fotoAsset.create({
    data: {
      url: secureUrl,
      item_id: itemId,
    },
  });

  res.status(201).json(asset);
};
