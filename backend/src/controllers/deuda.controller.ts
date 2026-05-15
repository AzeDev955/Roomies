import express from 'express';
import { prisma } from '../lib/prisma';
import { usuarioPerteneceAVivienda } from '../services/gasto.service';
import {
  construirCamposMediaDocumento,
} from '../services/media-reference.service';
import { mediaProviderErrorToHttp, uploadImageMedia } from '../services/media-upload.service';

const obtenerParamNumerico = (valor: string | string[] | undefined) => {
  const normalizado = Array.isArray(valor) ? valor[0] : valor;

  if (!normalizado) {
    return NaN;
  }

  return parseInt(normalizado, 10);
};

export const subirJustificanteDeuda: express.RequestHandler = async (req, res) => {
  const deudaId = obtenerParamNumerico(req.params.deudaId);
  const usuarioId = req.usuario!.id;

  if (!Number.isInteger(deudaId) || deudaId <= 0) {
    res.status(400).json({ error: 'deudaId inválido.' });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: 'Debes adjuntar una imagen.' });
    return;
  }

  const deuda = await prisma.deuda.findUnique({
    where: { id: deudaId },
    include: {
      gasto: {
        select: {
          vivienda_id: true,
        },
      },
    },
  });

  if (!deuda) {
    res.status(404).json({ error: 'Deuda no encontrada.' });
    return;
  }

  const pertenece = await usuarioPerteneceAVivienda(deuda.gasto.vivienda_id, usuarioId);

  if (!pertenece) {
    res.status(403).json({ error: 'No perteneces a la vivienda de esta deuda.' });
    return;
  }

  if (deuda.deudor_id !== usuarioId) {
    res.status(403).json({ error: 'Solo el deudor puede subir el justificante de esta deuda.' });
    return;
  }

  let justificanteMedia;
  try {
    justificanteMedia = await uploadImageMedia({
      file: req.file,
      purpose: 'payment-proof',
      visibility: 'private',
      ownerId: usuarioId,
      viviendaId: deuda.gasto.vivienda_id,
      preferredVariant: 'medium',
    });
  } catch (error) {
    const mapped = mediaProviderErrorToHttp(error);
    res.status(mapped.status).json({ error: mapped.message });
    return;
  }

  if (!justificanteMedia?.key) {
    res.status(500).json({ error: 'No se pudo obtener la referencia del justificante subido.' });
    return;
  }

  const deudaActualizada = await prisma.deuda.update({
    where: { id: deudaId },
    data: construirCamposMediaDocumento('justificante', justificanteMedia),
  });

  res.status(201).json(deudaActualizada);
};
