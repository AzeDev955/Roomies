import express from 'express';
import { EstadoItem, RolUsuario } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';
import {
  construirCamposFotoAsset,
} from '../services/media-reference.service';
import { cleanupMediaReferences } from '../services/media-cleanup.service';
import { resolveOptionalMediaUrl } from '../services/media-serving.service';
import { mediaProviderErrorToHttp, uploadImageMedia } from '../services/media-upload.service';

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

type FotoInventarioRespuesta = {
  provider?: string | null;
  key?: string | null;
  url?: string | null;
};

const resolverFotoInventario = async <T extends FotoInventarioRespuesta>(foto: T) => {
  const {
    provider: _provider,
    key: _key,
    ...fotoPublica
  } = foto;

  return {
    ...fotoPublica,
    url: await resolveOptionalMediaUrl({
      url: foto.url,
      provider: foto.provider,
      key: foto.key,
      purpose: 'inventory-photo',
    }),
  };
};

const resolverFotosInventario = async <T extends { fotos: FotoInventarioRespuesta[] }>(item: T) => ({
  ...item,
  fotos: await Promise.all(item.fotos.map((foto) => resolverFotoInventario(foto))),
});

const obtenerHabitacionDelInquilinoEnVivienda = async (usuarioId: number, viviendaId: number) =>
  prisma.habitacion.findFirst({
    where: {
      vivienda_id: viviendaId,
      inquilino_id: usuarioId,
    },
    select: {
      id: true,
      vivienda_id: true,
    },
  });

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
    res.status(400).json({ error: 'viviendaId invÃ¡lido.' });
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
    typeof estado === 'string' ? (estado.trim().toUpperCase() as EstadoItem) : EstadoItem.BUENO;

  if (!ESTADOS_ITEM_VALIDOS.has(estadoNormalizado)) {
    res.status(400).json({ error: 'El estado del item no es vÃ¡lido.' });
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
    res.status(400).json({ error: 'habitacion_id invÃ¡lido.' });
    return;
  }

  if (tieneVivienda && (!Number.isInteger(viviendaIdBody) || viviendaIdBody <= 0)) {
    res.status(400).json({ error: 'vivienda_id invÃ¡lido.' });
    return;
  }

  if (habitacionId !== null) {
    const habitacionPerteneceAVivienda = vivienda.habitaciones.some(
      (habitacion) => habitacion.id === habitacionId,
    );

    if (!habitacionPerteneceAVivienda) {
      res.status(400).json({ error: 'La habitaciÃ³n no pertenece a esta vivienda.' });
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
          inquilino_id: true,
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
    res.status(400).json({ error: 'viviendaId invÃ¡lido.' });
    return;
  }

  const tieneAcceso = await usuarioTieneAccesoAVivienda(usuarioId, rol, viviendaId);
  if (!tieneAcceso) {
    res.status(403).json({ error: 'No tienes acceso al inventario de esta vivienda.' });
    return;
  }

  const items = await prisma.itemInventario.findMany({
    where:
      rol === RolUsuario.CASERO
        ? {
            OR: [
              { vivienda_id: viviendaId },
              { habitacion: { vivienda_id: viviendaId } },
            ],
          }
        : {
            OR: [
              { vivienda_id: viviendaId },
              { habitacion: { vivienda_id: viviendaId, es_habitable: false } },
              { habitacion: { vivienda_id: viviendaId, inquilino_id: usuarioId } },
            ],
          },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      estado: true,
      revisado_por_inquilino: true,
      revisado_por_inquilino_id: true,
      revisado_por_inquilino_en: true,
      habitacion_id: true,
      vivienda_id: true,
      fecha_registro: true,
      habitacion: {
        select: {
          id: true,
          nombre: true,
          tipo: true,
          inquilino_id: true,
        },
      },
      fotos: {
        select: {
          id: true,
          provider: true,
          key: true,
          url: true,
          variant: true,
          mime_type: true,
          size: true,
          width: true,
          height: true,
          fecha_subida: true,
        },
        orderBy: {
          fecha_subida: 'desc',
        },
      },
      ...(rol === RolUsuario.CASERO
        ? {
            revisado_por_inquilino_user: {
              select: {
                id: true,
                nombre: true,
                apellidos: true,
              },
            },
          }
        : {}),
    },
    orderBy: [
      { habitacion_id: 'asc' },
      { nombre: 'asc' },
      { fecha_registro: 'desc' },
    ],
  });

  res.status(200).json(await Promise.all(items.map((item) => resolverFotosInventario(item))));
};

export const marcarConformidadInventario: express.RequestHandler = async (req, res) => {
  const itemId = Number(req.params['itemId']);
  const usuarioId = req.usuario!.id;
  const rol = req.usuario!.rol;

  if (!Number.isInteger(itemId) || itemId <= 0) {
    res.status(400).json({ error: 'itemId invÃ¡lido.' });
    return;
  }

  if (rol !== RolUsuario.INQUILINO) {
    res.status(403).json({ error: 'Solo el inquilino puede dar conformidad al inventario.' });
    return;
  }

  const item = await prisma.itemInventario.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      estado: true,
      revisado_por_inquilino: true,
      revisado_por_inquilino_id: true,
      revisado_por_inquilino_en: true,
      habitacion_id: true,
      vivienda_id: true,
      fecha_registro: true,
      habitacion: {
        select: {
          id: true,
          nombre: true,
          tipo: true,
          vivienda_id: true,
          es_habitable: true,
          inquilino_id: true,
        },
      },
      fotos: {
        select: {
          id: true,
          provider: true,
          key: true,
          url: true,
          variant: true,
          mime_type: true,
          size: true,
          width: true,
          height: true,
          fecha_subida: true,
        },
        orderBy: {
          fecha_subida: 'desc',
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
    res.status(400).json({ error: 'El item de inventario no estÃ¡ vinculado a una vivienda vÃ¡lida.' });
    return;
  }

  const miHabitacion = await obtenerHabitacionDelInquilinoEnVivienda(usuarioId, viviendaId);
  if (!miHabitacion) {
    res.status(403).json({ error: 'No tienes acceso a este item de inventario.' });
    return;
  }

  const esItemDeZonaComun =
    item.vivienda_id === viviendaId ||
    (item.habitacion?.vivienda_id === viviendaId && item.habitacion.es_habitable === false);
  const esItemDeMiHabitacion =
    item.habitacion?.vivienda_id === viviendaId && item.habitacion.inquilino_id === usuarioId;

  if (!esItemDeZonaComun && !esItemDeMiHabitacion) {
    res.status(403).json({ error: 'No puedes validar items de otra habitaciÃ³n.' });
    return;
  }

  if (
    item.revisado_por_inquilino &&
    item.revisado_por_inquilino_id !== null &&
    item.revisado_por_inquilino_id !== usuarioId
  ) {
    res.status(409).json({ error: 'Este item ya fue validado por otro inquilino.' });
    return;
  }

  if (item.revisado_por_inquilino && item.revisado_por_inquilino_id === usuarioId) {
    res.status(200).json(await resolverFotosInventario(item));
    return;
  }

  const itemActualizado = await prisma.itemInventario.update({
    where: { id: itemId },
    data: {
      revisado_por_inquilino: true,
      revisado_por_inquilino_id: usuarioId,
      revisado_por_inquilino_en: new Date(),
    },
    include: {
      habitacion: {
        select: {
          id: true,
          nombre: true,
          tipo: true,
          inquilino_id: true,
        },
      },
      fotos: {
        orderBy: {
          fecha_subida: 'desc',
        },
      },
    },
  });

  res.status(200).json(await resolverFotosInventario(itemActualizado));
};

export const subirFotoInventario: express.RequestHandler = async (req, res) => {
  const itemId = Number(req.params['itemId']);
  const usuarioId = req.usuario!.id;
  const rol = req.usuario!.rol;

  if (!Number.isInteger(itemId) || itemId <= 0) {
    res.status(400).json({ error: 'itemId invÃ¡lido.' });
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
    res.status(400).json({ error: 'El item de inventario no estÃ¡ vinculado a una vivienda vÃ¡lida.' });
    return;
  }

  const tieneAcceso = await usuarioTieneAccesoAVivienda(usuarioId, rol, viviendaId);
  if (!tieneAcceso) {
    res.status(403).json({ error: 'No tienes permiso para subir fotos a este item.' });
    return;
  }

  let fotoMedia;
  try {
    fotoMedia = await uploadImageMedia({
      file: req.file,
      purpose: 'inventory-photo',
      visibility: 'private',
      ownerId: usuarioId,
      viviendaId,
      preferredVariant: 'medium',
    });
  } catch (error) {
    const mapped = mediaProviderErrorToHttp(error);
    res.status(mapped.status).json({ error: mapped.message });
    return;
  }

  if (!fotoMedia?.key) {
    res.status(500).json({ error: 'No se pudo obtener la referencia de la imagen subida.' });
    return;
  }

  const asset = await prisma.fotoAsset.create({
    data: {
      ...construirCamposFotoAsset(fotoMedia),
      item_id: itemId,
    },
  });

  res.status(201).json(await resolverFotoInventario(asset));
};

export const eliminarItemInventario: express.RequestHandler = async (req, res) => {
  const itemId = Number(req.params['itemId']);
  const usuarioId = req.usuario!.id;
  const rol = req.usuario!.rol;

  if (!Number.isInteger(itemId) || itemId <= 0) {
    res.status(400).json({ error: 'itemId invÃƒÂ¡lido.' });
    return;
  }

  if (rol !== RolUsuario.CASERO) {
    res.status(403).json({ error: 'Solo el casero puede eliminar items de inventario.' });
    return;
  }

  const item = await prisma.itemInventario.findUnique({
    where: { id: itemId },
    include: {
      habitacion: { select: { vivienda_id: true } },
      vivienda: { select: { id: true, casero_id: true } },
      fotos: {
        select: {
          provider: true,
          key: true,
          variant: true,
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
    res.status(400).json({ error: 'El item de inventario no estÃƒÂ¡ vinculado a una vivienda vÃƒÂ¡lida.' });
    return;
  }

  const vivienda =
    item.vivienda?.id === viviendaId
      ? item.vivienda
      : await prisma.vivienda.findFirst({ where: { id: viviendaId }, select: { id: true, casero_id: true } });

  if (!vivienda || vivienda.casero_id !== usuarioId) {
    res.status(403).json({ error: 'No tienes permiso para eliminar este item de inventario.' });
    return;
  }

  await prisma.itemInventario.delete({ where: { id: itemId } });
  const cleanup = await cleanupMediaReferences(item.fotos, {
    includeImageVariants: true,
    context: `inventario:${itemId}:delete`,
  });

  res.status(200).json({
    ok: true,
    item_id: itemId,
    ...(cleanup.failed.length > 0 ? { media_cleanup_pending: true } : {}),
  });
};
