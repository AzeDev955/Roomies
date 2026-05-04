import express from 'express';
import { prisma } from '../lib/prisma';
import { usuarioEsCaseroDeVivienda } from '../services/gasto.service';

const obtenerParamNumerico = (valor: string | string[] | undefined) => {
  const normalizado = Array.isArray(valor) ? valor[0] : valor;

  if (!normalizado) {
    return NaN;
  }

  return parseInt(normalizado, 10);
};

export const listarGastosRecurrentes: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const usuarioId = req.usuario!.id;

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId inválido.' });
    return;
  }

  const esCasero = await usuarioEsCaseroDeVivienda(viviendaId, usuarioId);
  if (!esCasero) {
    res.status(403).json({ error: 'Solo el casero puede ver los gastos fijos de esta vivienda.' });
    return;
  }

  const gastosRecurrentes = await prisma.gastoRecurrente.findMany({
    where: { vivienda_id: viviendaId },
    orderBy: [{ activo: 'desc' }, { dia_del_mes: 'asc' }, { id: 'desc' }],
    include: {
      pagador: { select: { id: true, nombre: true, apellidos: true } },
    },
  });

  res.status(200).json(gastosRecurrentes);
};

export const crearGastoRecurrente: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const pagadorId = req.usuario!.id;
  const { concepto, importe, dia_del_mes } = req.body as {
    concepto: string;
    importe: number;
    dia_del_mes: number;
  };

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId inválido.' });
    return;
  }

  if (!concepto?.trim() || typeof importe !== 'number' || importe <= 0) {
    res.status(400).json({ error: 'concepto e importe (> 0) son obligatorios.' });
    return;
  }

  if (!Number.isInteger(dia_del_mes) || dia_del_mes < 1 || dia_del_mes > 31) {
    res.status(400).json({ error: 'dia_del_mes debe ser un entero entre 1 y 31.' });
    return;
  }

  const esCasero = await usuarioEsCaseroDeVivienda(viviendaId, pagadorId);
  if (!esCasero) {
    res.status(403).json({ error: 'Solo el casero puede crear gastos fijos en esta vivienda.' });
    return;
  }

  const gastoRecurrente = await prisma.gastoRecurrente.create({
    data: {
      concepto: concepto.trim(),
      importe,
      tipo: 'FACTURA_MENSUAL',
      dia_del_mes,
      vivienda_id: viviendaId,
      pagador_id: pagadorId,
    },
    include: {
      pagador: { select: { id: true, nombre: true, apellidos: true } },
    },
  });

  res.status(201).json(gastoRecurrente);
};

export const actualizarGastoRecurrente: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const gastoRecurrenteId = obtenerParamNumerico(req.params.gastoRecurrenteId);
  const usuarioId = req.usuario!.id;
  const { concepto, importe, dia_del_mes, activo } = req.body as {
    concepto?: string;
    importe?: number;
    dia_del_mes?: number;
    activo?: boolean;
  };

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId invÃ¡lido.' });
    return;
  }

  if (!Number.isInteger(gastoRecurrenteId) || gastoRecurrenteId <= 0) {
    res.status(400).json({ error: 'gastoRecurrenteId invÃ¡lido.' });
    return;
  }

  const esCasero = await usuarioEsCaseroDeVivienda(viviendaId, usuarioId);
  if (!esCasero) {
    res.status(403).json({ error: 'Solo el casero puede modificar gastos fijos de esta vivienda.' });
    return;
  }

  const gastoRecurrente = await prisma.gastoRecurrente.findFirst({
    where: { id: gastoRecurrenteId, vivienda_id: viviendaId },
    select: { id: true },
  });

  if (!gastoRecurrente) {
    res.status(404).json({ error: 'Gasto fijo no encontrado.' });
    return;
  }

  const data: {
    concepto?: string;
    importe?: number;
    dia_del_mes?: number;
    activo?: boolean;
  } = {};

  if (concepto !== undefined) {
    if (!concepto.trim()) {
      res.status(400).json({ error: 'concepto no puede estar vacÃ­o.' });
      return;
    }
    data.concepto = concepto.trim();
  }

  if (importe !== undefined) {
    if (typeof importe !== 'number' || importe <= 0) {
      res.status(400).json({ error: 'importe debe ser mayor que 0.' });
      return;
    }
    data.importe = importe;
  }

  if (dia_del_mes !== undefined) {
    if (!Number.isInteger(dia_del_mes) || dia_del_mes < 1 || dia_del_mes > 31) {
      res.status(400).json({ error: 'dia_del_mes debe ser un entero entre 1 y 31.' });
      return;
    }
    data.dia_del_mes = dia_del_mes;
  }

  if (activo !== undefined) {
    if (typeof activo !== 'boolean') {
      res.status(400).json({ error: 'activo debe ser booleano.' });
      return;
    }
    data.activo = activo;
  }

  if (Object.keys(data).length === 0) {
    res.status(400).json({ error: 'No hay campos vÃ¡lidos para actualizar.' });
    return;
  }

  const gastoActualizado = await prisma.gastoRecurrente.update({
    where: { id: gastoRecurrenteId },
    data,
    include: {
      pagador: { select: { id: true, nombre: true, apellidos: true } },
    },
  });

  res.status(200).json(gastoActualizado);
};

export const eliminarGastoRecurrente: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const gastoRecurrenteId = obtenerParamNumerico(req.params.gastoRecurrenteId);
  const usuarioId = req.usuario!.id;

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId invÃ¡lido.' });
    return;
  }

  if (!Number.isInteger(gastoRecurrenteId) || gastoRecurrenteId <= 0) {
    res.status(400).json({ error: 'gastoRecurrenteId invÃ¡lido.' });
    return;
  }

  const esCasero = await usuarioEsCaseroDeVivienda(viviendaId, usuarioId);
  if (!esCasero) {
    res.status(403).json({ error: 'Solo el casero puede eliminar gastos fijos de esta vivienda.' });
    return;
  }

  const gastoRecurrente = await prisma.gastoRecurrente.findFirst({
    where: { id: gastoRecurrenteId, vivienda_id: viviendaId },
    select: { id: true },
  });

  if (!gastoRecurrente) {
    res.status(404).json({ error: 'Gasto fijo no encontrado.' });
    return;
  }

  await prisma.gastoRecurrente.delete({
    where: { id: gastoRecurrenteId },
  });

  res.status(200).json({ ok: true, gasto_recurrente_id: gastoRecurrenteId });
};
