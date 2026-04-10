import express from 'express';
import { prisma } from '../lib/prisma';
import { usuarioPerteneceAVivienda } from '../services/gasto.service';

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

  const pertenece = await usuarioPerteneceAVivienda(viviendaId, usuarioId);
  if (!pertenece) {
    res.status(403).json({ error: 'No perteneces a esta vivienda.' });
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

  const pertenece = await usuarioPerteneceAVivienda(viviendaId, pagadorId);
  if (!pertenece) {
    res.status(403).json({ error: 'No perteneces a esta vivienda.' });
    return;
  }

  const gastoRecurrente = await prisma.gastoRecurrente.create({
    data: {
      concepto: concepto.trim(),
      importe,
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
