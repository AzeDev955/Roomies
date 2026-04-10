import express from 'express';
import { prisma } from '../lib/prisma';
import { crearGastoDividido, usuarioPerteneceAVivienda } from '../services/gasto.service';

const obtenerParamNumerico = (valor: string | string[] | undefined) => {
  const normalizado = Array.isArray(valor) ? valor[0] : valor;

  if (!normalizado) {
    return NaN;
  }

  return parseInt(normalizado, 10);
};

export const listarGastos: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const usuarioId = req.usuario!.id;

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId inválido.' });
    return;
  }

  const pertenece = await usuarioPerteneceAVivienda(viviendaId, usuarioId);

  if (!pertenece) {
    res.status(403).json({ error: 'No perteneces a esta vivienda.' });
    return;
  }

  const gastos = await prisma.gasto.findMany({
    where: { vivienda_id: viviendaId },
    orderBy: { fecha_creacion: 'desc' },
    include: {
      pagador: { select: { id: true, nombre: true, apellidos: true } },
      deudas: true,
    },
  });

  res.status(200).json(gastos);
};

export const listarDeudas: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const usuarioId = req.usuario!.id;

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId inválido.' });
    return;
  }

  const pertenece = await usuarioPerteneceAVivienda(viviendaId, usuarioId);

  if (!pertenece) {
    res.status(403).json({ error: 'No perteneces a esta vivienda.' });
    return;
  }

  const deudas = await prisma.deuda.findMany({
    where: {
      gasto: { vivienda_id: viviendaId },
      OR: [{ deudor_id: usuarioId }, { acreedor_id: usuarioId }],
    },
    include: {
      deudor:   { select: { id: true, nombre: true, apellidos: true } },
      acreedor: { select: { id: true, nombre: true, apellidos: true } },
      gasto:    { select: { concepto: true } },
    },
    orderBy: { id: 'desc' },
  });

  res.status(200).json(deudas);
};

export const saldarDeuda: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const deudaId = obtenerParamNumerico(req.params.deudaId);
  const usuarioId  = req.usuario!.id;

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId inválido.' });
    return;
  }

  if (!Number.isInteger(deudaId) || deudaId <= 0) {
    res.status(400).json({ error: 'deudaId inválido.' });
    return;
  }

  const pertenece = await usuarioPerteneceAVivienda(viviendaId, usuarioId);

  if (!pertenece) {
    res.status(403).json({ error: 'No perteneces a esta vivienda.' });
    return;
  }

  const deuda = await prisma.deuda.findFirst({
    where: { id: deudaId, gasto: { vivienda_id: viviendaId } },
  });

  if (!deuda) {
    res.status(404).json({ error: 'Deuda no encontrada.' });
    return;
  }

  if (deuda.deudor_id !== usuarioId) {
    res.status(403).json({ error: 'Solo el deudor puede saldar esta deuda.' });
    return;
  }

  if (deuda.estado === 'PAGADA') {
    res.status(409).json({ error: 'Esta deuda ya está saldada.' });
    return;
  }

  const actualizada = await prisma.deuda.update({
    where: { id: deudaId },
    data:  { estado: 'PAGADA' },
  });

  res.status(200).json(actualizada);
};

export const crearGasto: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const pagadorId = req.usuario!.id;

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId inválido.' });
    return;
  }

  const { concepto, importe, implicadosIds } = req.body as {
    concepto: string;
    importe: number;
    implicadosIds?: number[];
  };

  if (!concepto || importe == null || importe <= 0) {
    res.status(400).json({ error: 'concepto e importe (> 0) son obligatorios.' });
    return;
  }

  if (
    implicadosIds != null &&
    (!Array.isArray(implicadosIds) || implicadosIds.some((id) => !Number.isInteger(id)))
  ) {
    res.status(400).json({ error: 'implicadosIds debe ser un array de IDs numéricos.' });
    return;
  }

  // Verificar que el pagador pertenece a la vivienda (es inquilino de alguna habitación)
  const habitacionPagador = await usuarioPerteneceAVivienda(viviendaId, pagadorId);

  if (!habitacionPagador) {
    res.status(403).json({ error: 'No perteneces a esta vivienda.' });
    return;
  }

  try {
    const gasto = await crearGastoDividido({
      concepto,
      importe,
      viviendaId,
      pagadorId,
      implicadosIds,
    });

    res.status(201).json(gasto);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo registrar el gasto.';
    res.status(400).json({ error: mensaje });
  }
};
