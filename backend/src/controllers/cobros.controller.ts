import express from 'express';
import { prisma } from '../lib/prisma';

const obtenerParamNumerico = (valor: string | string[] | undefined) => {
  const normalizado = Array.isArray(valor) ? valor[0] : valor;

  if (!normalizado) {
    return NaN;
  }

  return parseInt(normalizado, 10);
};

export const listarCobrosVivienda: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const usuarioId = req.usuario!.id;

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId inválido.' });
    return;
  }

  const vivienda = await prisma.vivienda.findUnique({
    where: { id: viviendaId },
    select: {
      id: true,
      alias_nombre: true,
      direccion: true,
      casero_id: true,
    },
  });

  if (!vivienda) {
    res.status(404).json({ error: 'Vivienda no encontrada.' });
    return;
  }

  if (vivienda.casero_id !== usuarioId) {
    res.status(403).json({ error: 'No tienes acceso a los cobros de esta vivienda.' });
    return;
  }

  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const inicioMesSiguiente = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1);

  const deudas = await prisma.deuda.findMany({
    where: {
      acreedor_id: usuarioId,
      gasto: {
        vivienda_id: viviendaId,
        fecha_creacion: {
          gte: inicioMes,
          lt: inicioMesSiguiente,
        },
      },
    },
    include: {
      deudor: {
        select: {
          id: true,
          nombre: true,
          apellidos: true,
        },
      },
      gasto: {
        select: {
          id: true,
          concepto: true,
          fecha_creacion: true,
          factura_url: true,
        },
      },
    },
    orderBy: [
      { estado: 'asc' },
      { id: 'desc' },
    ],
  });

  const totalPagadoMes = deudas
    .filter((deuda) => deuda.estado === 'PAGADA')
    .reduce((acumulado, deuda) => acumulado + deuda.importe, 0);

  const totalPendiente = deudas
    .filter((deuda) => deuda.estado === 'PENDIENTE')
    .reduce((acumulado, deuda) => acumulado + deuda.importe, 0);

  res.status(200).json({
    vivienda: {
      id: vivienda.id,
      alias_nombre: vivienda.alias_nombre,
      direccion: vivienda.direccion,
    },
    periodo: {
      inicio: inicioMes.toISOString(),
      fin: inicioMesSiguiente.toISOString(),
    },
    resumen: {
      total_pagado_mes: totalPagadoMes,
      total_pendiente: totalPendiente,
      total_deudas: deudas.length,
    },
    deudas: deudas.map((deuda) => ({
      id: deuda.id,
      importe: deuda.importe,
      estado: deuda.estado,
      justificante_url: deuda.justificante_url,
      gasto: deuda.gasto,
      deudor: {
        id: deuda.deudor.id,
        nombre: deuda.deudor.nombre,
        apellidos: deuda.deudor.apellidos,
        avatar: null,
      },
    })),
  });
};
