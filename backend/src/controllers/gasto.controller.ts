import express from 'express';
import { cloudinaryEstaConfigurado } from '../config/cloudinary.config';
import { prisma } from '../lib/prisma';
import {
  crearGastoDividido,
  usuarioEsCaseroDeVivienda,
  usuarioPerteneceAVivienda,
} from '../services/gasto.service';

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

export const actualizarGasto: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const gastoId = obtenerParamNumerico(req.params.gastoId);
  const usuarioId = req.usuario!.id;

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId invalido.' });
    return;
  }

  if (!Number.isInteger(gastoId) || gastoId <= 0) {
    res.status(400).json({ error: 'gastoId invalido.' });
    return;
  }

  const { concepto, importe, fecha } = req.body as {
    concepto?: string;
    importe?: number;
    fecha?: string;
  };

  const datosActualizacion: {
    concepto?: string;
    importe?: number;
    fecha_creacion?: Date;
  } = {};

  if (concepto !== undefined) {
    if (!concepto.trim()) {
      res.status(400).json({ error: 'El concepto no puede estar vacio.' });
      return;
    }

    datosActualizacion.concepto = concepto.trim();
  }

  if (importe !== undefined) {
    if (typeof importe !== 'number' || !Number.isFinite(importe) || importe <= 0) {
      res.status(400).json({ error: 'El importe debe ser un numero mayor que 0.' });
      return;
    }

    datosActualizacion.importe = importe;
  }

  if (fecha !== undefined) {
    const fechaActualizada = new Date(fecha);

    if (Number.isNaN(fechaActualizada.getTime())) {
      res.status(400).json({ error: 'La fecha indicada no es valida.' });
      return;
    }

    datosActualizacion.fecha_creacion = fechaActualizada;
  }

  if (Object.keys(datosActualizacion).length === 0) {
    res.status(400).json({ error: 'No hay campos validos para actualizar.' });
    return;
  }

  const esCasero = await usuarioEsCaseroDeVivienda(viviendaId, usuarioId);

  if (!esCasero) {
    res.status(403).json({ error: 'Solo el casero puede editar facturas de esta vivienda.' });
    return;
  }

  const gasto = await prisma.gasto.findFirst({
    where: { id: gastoId, vivienda_id: viviendaId },
    include: { deudas: true },
  });

  if (!gasto) {
    res.status(404).json({ error: 'Gasto no encontrado.' });
    return;
  }

  const importeCambia =
    datosActualizacion.importe !== undefined &&
    Number(datosActualizacion.importe.toFixed(2)) !== Number(gasto.importe.toFixed(2));
  const hayPagosRegistrados = gasto.deudas.some((deuda) => deuda.estado === 'PAGADA');

  if (importeCambia && hayPagosRegistrados) {
    res.status(400).json({
      error: 'El importe no puede modificarse porque ya existen pagos registrados.',
    });
    return;
  }

  const gastoActualizado = await prisma.$transaction(async (tx) => {
    if (importeCambia && gasto.deudas.length > 0) {
      const importePorDeuda = parseFloat((datosActualizacion.importe! / gasto.deudas.length).toFixed(2));

      await tx.deuda.updateMany({
        where: { gasto_id: gasto.id },
        data: { importe: importePorDeuda },
      });
    }

    return tx.gasto.update({
      where: { id: gasto.id },
      data: datosActualizacion,
      include: {
        pagador: { select: { id: true, nombre: true, apellidos: true } },
        deudas: true,
      },
    });
  });

  res.status(200).json(gastoActualizado);
};

export const subirFacturaGasto: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const gastoId = obtenerParamNumerico(req.params.gastoId);
  const usuarioId = req.usuario!.id;

  if (!cloudinaryEstaConfigurado) {
    res.status(500).json({ error: 'Cloudinary no esta configurado en el servidor.' });
    return;
  }

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId invalido.' });
    return;
  }

  if (!Number.isInteger(gastoId) || gastoId <= 0) {
    res.status(400).json({ error: 'gastoId invalido.' });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: 'Debes adjuntar una imagen de la factura.' });
    return;
  }

  const esCasero = await usuarioEsCaseroDeVivienda(viviendaId, usuarioId);

  if (!esCasero) {
    res.status(403).json({ error: 'Solo el casero puede subir la foto de esta factura.' });
    return;
  }

  const gasto = await prisma.gasto.findFirst({
    where: { id: gastoId, vivienda_id: viviendaId },
  });

  if (!gasto) {
    res.status(404).json({ error: 'Gasto no encontrado.' });
    return;
  }

  const secureUrl = (req.file as Express.Multer.File & { path?: string }).path;

  if (!secureUrl) {
    res.status(500).json({ error: 'No se pudo obtener la URL de la factura subida.' });
    return;
  }

  const gastoActualizado = await prisma.gasto.update({
    where: { id: gasto.id },
    data: { factura_url: secureUrl },
    include: {
      pagador: { select: { id: true, nombre: true, apellidos: true } },
      deudas: true,
    },
  });

  res.status(201).json(gastoActualizado);
};
