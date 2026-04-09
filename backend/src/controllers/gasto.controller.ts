import express from 'express';
import { prisma } from '../lib/prisma';

export const listarGastos: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params.viviendaId, 10);
  const usuarioId = req.usuario!.id;

  const pertenece = await prisma.habitacion.findFirst({
    where: { vivienda_id: viviendaId, inquilino_id: usuarioId },
  });

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
  const viviendaId = parseInt(req.params.viviendaId, 10);
  const usuarioId = req.usuario!.id;

  const pertenece = await prisma.habitacion.findFirst({
    where: { vivienda_id: viviendaId, inquilino_id: usuarioId },
  });

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
  const viviendaId = parseInt(req.params.viviendaId, 10);
  const deudaId    = parseInt(req.params.deudaId, 10);
  const usuarioId  = req.usuario!.id;

  const pertenece = await prisma.habitacion.findFirst({
    where: { vivienda_id: viviendaId, inquilino_id: usuarioId },
  });

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
  const viviendaId = parseInt(req.params.viviendaId, 10);
  const pagadorId = req.usuario!.id;

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
  const habitacionPagador = await prisma.habitacion.findFirst({
    where: { vivienda_id: viviendaId, inquilino_id: pagadorId },
  });

  if (!habitacionPagador) {
    res.status(403).json({ error: 'No perteneces a esta vivienda.' });
    return;
  }

  // Obtener todos los inquilinos activos de la vivienda
  const habitaciones = await prisma.habitacion.findMany({
    where: {
      vivienda_id: viviendaId,
      inquilino_id: { not: null },
      es_habitable: true,
    },
    select: {
      inquilino_id: true,
    },
  });

  const inquilinosActivosIds = habitaciones.map((h) => h.inquilino_id!);
  const inquilinosActivosSet = new Set(inquilinosActivosIds);
  const implicadosNormalizados = Array.isArray(implicadosIds)
    ? [...new Set(implicadosIds)]
    : [];

  if (implicadosNormalizados.length > 0) {
    const hayInvalidos = implicadosNormalizados.some((id) => !inquilinosActivosSet.has(id));
    if (hayInvalidos) {
      res.status(400).json({ error: 'Todos los implicados deben pertenecer a la vivienda.' });
      return;
    }
  }

  const participantesIds =
    implicadosNormalizados.length > 0 ? implicadosNormalizados : inquilinosActivosIds;

  const totalParticipantes = participantesIds.length;
  if (totalParticipantes === 0) {
    res.status(400).json({ error: 'No hay inquilinos activos para repartir este gasto.' });
    return;
  }

  const deudoresIds = participantesIds.filter((id) => id !== pagadorId);
  const importePorPersona = parseFloat((importe / totalParticipantes).toFixed(2));

  const [gasto] = await prisma.$transaction([
    prisma.gasto.create({
      data: {
        concepto,
        importe,
        pagador_id: pagadorId,
        vivienda_id: viviendaId,
        deudas: {
          create: deudoresIds.map((deudorId) => ({
            deudor_id: deudorId,
            acreedor_id: pagadorId,
            importe: importePorPersona,
          })),
        },
      },
      include: { deudas: true },
    }),
  ]);

  res.status(201).json(gasto);
};
