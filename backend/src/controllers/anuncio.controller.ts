import express from 'express';
import { prisma } from '../lib/prisma';
import { RolUsuario } from '../generated/prisma/client';
import { enviarNotificacionPush } from '../services/notification.service';

async function verificarAccesoVivienda(
  usuarioId: number,
  rol: RolUsuario,
  viviendaId: number,
): Promise<boolean> {
  if (rol === RolUsuario.CASERO) {
    const vivienda = await prisma.vivienda.findFirst({
      where: { id: viviendaId, casero_id: usuarioId },
      select: { id: true },
    });
    return vivienda !== null;
  } else {
    const habitacion = await prisma.habitacion.findFirst({
      where: { vivienda_id: viviendaId, inquilino_id: usuarioId },
      select: { id: true },
    });
    return habitacion !== null;
  }
}

export const listarAnuncios: express.RequestHandler = async (req, res) => {
  const viviendaId = Number(req.query['viviendaId']);
  if (!viviendaId || isNaN(viviendaId)) {
    res.status(400).json({ error: 'El parámetro viviendaId es obligatorio.' });
    return;
  }

  const usuarioId = req.usuario!.id;
  const rol = req.usuario!.rol;

  const tieneAcceso = await verificarAccesoVivienda(usuarioId, rol, viviendaId);
  if (!tieneAcceso) {
    res.status(403).json({ error: 'No tienes acceso a los anuncios de esta vivienda.' });
    return;
  }

  const anuncios = await prisma.anuncio.findMany({
    where: { vivienda_id: viviendaId },
    include: { autor: { select: { id: true, nombre: true } } },
    orderBy: { fecha_creacion: 'desc' },
  });

  res.json(anuncios);
};

export const crearAnuncio: express.RequestHandler = async (req, res) => {
  const { titulo, contenido, vivienda_id } = req.body as {
    titulo?: string;
    contenido?: string;
    vivienda_id?: number;
  };

  if (!titulo || !contenido || !vivienda_id) {
    res.status(400).json({ error: 'Faltan campos obligatorios: titulo, contenido, vivienda_id.' });
    return;
  }

  const usuarioId = req.usuario!.id;
  const rol = req.usuario!.rol;

  const tieneAcceso = await verificarAccesoVivienda(usuarioId, rol, Number(vivienda_id));
  if (!tieneAcceso) {
    res.status(403).json({ error: 'No tienes acceso a esta vivienda.' });
    return;
  }

  const anuncio = await prisma.anuncio.create({
    data: {
      titulo,
      contenido,
      vivienda_id: Number(vivienda_id),
      autor_id: usuarioId,
    },
    include: { autor: { select: { id: true, nombre: true } } },
  });

  // Notificar al resto de miembros de la vivienda de forma asíncrona
  const miembros = await prisma.habitacion.findMany({
    where: { vivienda_id: Number(vivienda_id), inquilino_id: { not: null } },
    select: { inquilino_id: true },
  });

  const vivienda = await prisma.vivienda.findUnique({
    where: { id: Number(vivienda_id) },
    select: { casero_id: true },
  });

  const destinatarioIds = [
    ...miembros.map((h) => h.inquilino_id as number),
    vivienda!.casero_id,
  ].filter((id) => id !== usuarioId);

  enviarNotificacionPush(
    destinatarioIds,
    `🗣️ Nuevo aviso de ${anuncio.autor.nombre}`,
    anuncio.titulo,
  ).catch((err) => console.error('[push] Error notificando anuncio:', err));

  res.status(201).json(anuncio);
};

export const eliminarAnuncio: express.RequestHandler = async (req, res) => {
  const id = Number(req.params['id']);
  const usuarioId = req.usuario!.id;

  const anuncio = await prisma.anuncio.findUnique({
    where: { id },
    include: { vivienda: { select: { casero_id: true } } },
  });

  if (!anuncio) {
    res.status(404).json({ error: 'Anuncio no encontrado.' });
    return;
  }

  const esAutor = anuncio.autor_id === usuarioId;
  const esCasero = anuncio.vivienda.casero_id === usuarioId;

  if (!esAutor && !esCasero) {
    res.status(403).json({ error: 'No tienes permiso para eliminar este anuncio.' });
    return;
  }

  await prisma.anuncio.delete({ where: { id } });
  res.status(204).send();
};
