import express from 'express';
import { cloudinaryEstaConfigurado } from '../config/cloudinary.config';
import { RolUsuario } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';

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
