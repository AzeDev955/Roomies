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

export const crearGasto: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params.viviendaId, 10);
  const pagadorId = req.usuario!.id;

  const { concepto, importe } = req.body as { concepto: string; importe: number };

  if (!concepto || importe == null || importe <= 0) {
    res.status(400).json({ error: 'concepto e importe (> 0) son obligatorios.' });
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

  // Obtener todos los inquilinos actuales de la vivienda
  const habitaciones = await prisma.habitacion.findMany({
    where: {
      vivienda_id: viviendaId,
      inquilino_id: { not: null },
      es_habitable: true,
    },
    select: { inquilino_id: true },
  });

  const inquilinoIds = habitaciones
    .map((h) => h.inquilino_id!)
    .filter((id) => id !== pagadorId);

  const totalInquilinos = inquilinoIds.length + 1; // incluye al pagador
  const importePorPersona = parseFloat((importe / totalInquilinos).toFixed(2));

  const [gasto] = await prisma.$transaction([
    prisma.gasto.create({
      data: {
        concepto,
        importe,
        pagador_id: pagadorId,
        vivienda_id: viviendaId,
        deudas: {
          create: inquilinoIds.map((deudorId) => ({
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
