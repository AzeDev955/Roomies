import express from 'express';
import { RolUsuario } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';
import { construirCamposFotoAsset } from '../services/media-reference.service';
import { cleanupMediaReferences } from '../services/media-cleanup.service';
import { resolveOptionalMediaUrl } from '../services/media-serving.service';
import { mediaProviderErrorToHttp, uploadImageMedia } from '../services/media-upload.service';

type FotoViviendaRespuesta = {
  provider?: string | null;
  key?: string | null;
  url?: string | null;
};

const parsePositiveId = (value: unknown) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const usuarioPuedeVerVivienda = async (usuarioId: number, rol: RolUsuario, viviendaId: number) => {
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

const obtenerViviendaGestionable = async (usuarioId: number, viviendaId: number) =>
  prisma.vivienda.findFirst({
    where: { id: viviendaId, casero_id: usuarioId },
    select: { id: true },
  });

const resolverFotoVivienda = async <T extends FotoViviendaRespuesta>(foto: T) => {
  const { provider: _provider, key: _key, ...fotoPublica } = foto;

  return {
    ...fotoPublica,
    url: await resolveOptionalMediaUrl({
      url: foto.url,
      provider: foto.provider,
      key: foto.key,
      purpose: 'housing-photo',
    }),
  };
};

export const listarFotosVivienda: express.RequestHandler = async (req, res) => {
  const viviendaId = parsePositiveId(req.params['id']);
  const usuario = req.usuario!;

  if (!viviendaId) {
    res.status(400).json({ error: 'ID de vivienda invalido.' });
    return;
  }

  const tieneAcceso = await usuarioPuedeVerVivienda(usuario.id, usuario.rol, viviendaId);
  if (!tieneAcceso) {
    res.status(403).json({ error: 'No tienes acceso a las fotos de esta vivienda.' });
    return;
  }

  const fotos = await prisma.fotoVivienda.findMany({
    where: { vivienda_id: viviendaId },
    orderBy: [{ es_portada: 'desc' }, { orden: 'asc' }, { fecha_subida: 'asc' }],
  });

  res.status(200).json(await Promise.all(fotos.map((foto) => resolverFotoVivienda(foto))));
};

export const subirFotoVivienda: express.RequestHandler = async (req, res) => {
  const viviendaId = parsePositiveId(req.params['id']);
  const usuario = req.usuario!;

  if (!viviendaId) {
    res.status(400).json({ error: 'ID de vivienda invalido.' });
    return;
  }

  if (usuario.rol !== RolUsuario.CASERO) {
    res.status(403).json({ error: 'Solo el casero puede subir fotos de la vivienda.' });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: 'Debes adjuntar una imagen.' });
    return;
  }

  const vivienda = await obtenerViviendaGestionable(usuario.id, viviendaId);
  if (!vivienda) {
    res.status(403).json({ error: 'No tienes permiso para gestionar fotos de esta vivienda.' });
    return;
  }

  let fotoMedia;
  try {
    fotoMedia = await uploadImageMedia({
      file: req.file,
      purpose: 'housing-photo',
      visibility: 'private',
      ownerId: usuario.id,
      viviendaId,
      preferredVariant: 'large',
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

  const totalFotos = await prisma.fotoVivienda.count({ where: { vivienda_id: viviendaId } });
  const foto = await prisma.fotoVivienda.create({
    data: {
      ...construirCamposFotoAsset(fotoMedia),
      vivienda_id: viviendaId,
      orden: totalFotos,
      es_portada: totalFotos === 0,
    },
  });

  res.status(201).json(await resolverFotoVivienda(foto));
};

export const actualizarFotoVivienda: express.RequestHandler = async (req, res) => {
  const viviendaId = parsePositiveId(req.params['id']);
  const fotoId = parsePositiveId(req.params['fotoId']);
  const usuario = req.usuario!;
  const { es_portada, orden } = req.body as { es_portada?: unknown; orden?: unknown };

  if (!viviendaId || !fotoId) {
    res.status(400).json({ error: 'ID de vivienda o foto invalido.' });
    return;
  }

  if (usuario.rol !== RolUsuario.CASERO) {
    res.status(403).json({ error: 'Solo el casero puede editar fotos de la vivienda.' });
    return;
  }

  const vivienda = await obtenerViviendaGestionable(usuario.id, viviendaId);
  if (!vivienda) {
    res.status(403).json({ error: 'No tienes permiso para gestionar fotos de esta vivienda.' });
    return;
  }

  const foto = await prisma.fotoVivienda.findFirst({
    where: { id: fotoId, vivienda_id: viviendaId },
  });
  if (!foto) {
    res.status(404).json({ error: 'Foto de vivienda no encontrada.' });
    return;
  }

  const data: { es_portada?: boolean; orden?: number } = {};
  if (es_portada !== undefined) {
    if (typeof es_portada !== 'boolean') {
      res.status(400).json({ error: 'es_portada debe ser booleano.' });
      return;
    }
    data.es_portada = es_portada;
  }

  if (orden !== undefined) {
    const ordenNum = Number(orden);
    if (!Number.isInteger(ordenNum) || ordenNum < 0) {
      res.status(400).json({ error: 'orden debe ser un entero mayor o igual que 0.' });
      return;
    }
    data.orden = ordenNum;
  }

  if (Object.keys(data).length === 0) {
    res.status(400).json({ error: 'No hay cambios para actualizar.' });
    return;
  }

  const fotoActualizada = await prisma.$transaction(async (tx) => {
    if (data.es_portada === true) {
      await tx.fotoVivienda.updateMany({
        where: { vivienda_id: viviendaId, id: { not: fotoId } },
        data: { es_portada: false },
      });
    }

    return tx.fotoVivienda.update({
      where: { id: fotoId },
      data,
    });
  });

  res.status(200).json(await resolverFotoVivienda(fotoActualizada));
};

export const eliminarFotoVivienda: express.RequestHandler = async (req, res) => {
  const viviendaId = parsePositiveId(req.params['id']);
  const fotoId = parsePositiveId(req.params['fotoId']);
  const usuario = req.usuario!;

  if (!viviendaId || !fotoId) {
    res.status(400).json({ error: 'ID de vivienda o foto invalido.' });
    return;
  }

  if (usuario.rol !== RolUsuario.CASERO) {
    res.status(403).json({ error: 'Solo el casero puede borrar fotos de la vivienda.' });
    return;
  }

  const vivienda = await obtenerViviendaGestionable(usuario.id, viviendaId);
  if (!vivienda) {
    res.status(403).json({ error: 'No tienes permiso para gestionar fotos de esta vivienda.' });
    return;
  }

  const foto = await prisma.fotoVivienda.findFirst({
    where: { id: fotoId, vivienda_id: viviendaId },
    select: { id: true, provider: true, key: true, variant: true, es_portada: true },
  });

  if (!foto) {
    res.status(404).json({ error: 'Foto de vivienda no encontrada.' });
    return;
  }

  await prisma.fotoVivienda.delete({ where: { id: fotoId } });

  if (foto.es_portada) {
    const siguiente = await prisma.fotoVivienda.findFirst({
      where: { vivienda_id: viviendaId },
      orderBy: [{ orden: 'asc' }, { fecha_subida: 'asc' }],
      select: { id: true },
    });

    if (siguiente) {
      await prisma.fotoVivienda.update({
        where: { id: siguiente.id },
        data: { es_portada: true },
      });
    }
  }

  const cleanup = await cleanupMediaReferences([foto], {
    includeImageVariants: true,
    context: `vivienda:${viviendaId}:foto:${fotoId}:delete`,
  });

  res.status(200).json({
    ok: true,
    foto_id: fotoId,
    ...(cleanup.failed.length > 0 ? { media_cleanup_pending: true } : {}),
  });
};
