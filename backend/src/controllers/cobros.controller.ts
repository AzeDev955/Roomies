import express from 'express';
import { prisma } from '../lib/prisma';
import { TIPOS_GASTO_CASERO } from '../services/gasto.service';
import { resolveOptionalMediaUrl } from '../services/media-serving.service';

const obtenerParamNumerico = (valor: string | string[] | undefined) => {
  const normalizado = Array.isArray(valor) ? valor[0] : valor;

  if (!normalizado) {
    return NaN;
  }

  return parseInt(normalizado, 10);
};

const aCentimos = (importe: number) => Math.round((importe + Number.EPSILON) * 100);
const desdeCentimos = (centimos: number) => centimos / 100;

const sumarImportes = (importes: number[]) =>
  desdeCentimos(importes.reduce((total, importe) => total + aCentimos(importe), 0));

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
        tipo: { in: [...TIPOS_GASTO_CASERO] },
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
          importe: true,
          tipo: true,
          factura_url: true,
          factura_provider: true,
          factura_key: true,
          factura_variant: true,
          factura_mime_type: true,
          factura_size: true,
          categoria_fiscal: true,
          deducible_previsto: true,
          notas_fiscales: true,
          prorrateo_fiscal: true,
          fecha_creacion: true,
          fecha_modificacion: true,
          modificado_por: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
            },
          },
        },
      },
    },
    orderBy: [
      { estado: 'asc' },
      { id: 'desc' },
    ],
  });

  const totalPagadoMes = sumarImportes(
    deudas.filter((deuda) => deuda.estado === 'PAGADA').map((deuda) => deuda.importe),
  );
  const totalPendiente = sumarImportes(
    deudas.filter((deuda) => deuda.estado === 'PENDIENTE').map((deuda) => deuda.importe),
  );
  const deudasConUrls = await Promise.all(
    deudas.map(async (deuda) => {
      const {
        justificante_provider: _justificanteProvider,
        justificante_key: _justificanteKey,
        ...deudaPublica
      } = deuda;
      const {
        factura_provider: _facturaProvider,
        factura_key: _facturaKey,
        ...gastoPublico
      } = deuda.gasto;

      return {
        ...deudaPublica,
        justificante_url: await resolveOptionalMediaUrl({
          url: deuda.justificante_url,
          provider: deuda.justificante_provider,
          key: deuda.justificante_key,
          purpose: 'payment-proof',
        }),
        gasto: {
          ...gastoPublico,
          factura_url: await resolveOptionalMediaUrl({
            url: deuda.gasto.factura_url,
            provider: deuda.gasto.factura_provider,
            key: deuda.gasto.factura_key,
            purpose: 'expense-invoice',
          }),
        },
      };
    }),
  );

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
    deudas: deudasConUrls.map((deuda) => ({
      id: deuda.id,
      importe: deuda.importe,
      estado: deuda.estado,
      justificante_url: deuda.justificante_url,
      justificante_variant: deuda.justificante_variant,
      justificante_mime_type: deuda.justificante_mime_type,
      justificante_size: deuda.justificante_size,
      justificante_width: deuda.justificante_width,
      justificante_height: deuda.justificante_height,
      categoria: 'CASERO',
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
