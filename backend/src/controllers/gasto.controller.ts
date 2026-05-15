import express from 'express';
import { prisma } from '../lib/prisma';
import {
  CategoriaFiscalGastoRoomies,
  crearGastoDividido,
  esCategoriaFiscalGasto,
  MetadataFiscalGastoInput,
  normalizarImporteMonetario,
  repartirImporteEnCentimos,
  TIPOS_GASTO_CASERO,
  usuarioEsCaseroDeVivienda,
  usuarioPerteneceAVivienda,
} from '../services/gasto.service';
import {
  construirCamposMediaDocumento,
} from '../services/media-reference.service';
import { cleanupMediaReferences } from '../services/media-cleanup.service';
import { mediaProviderErrorToHttp, uploadDocumentMedia, uploadImageMedia } from '../services/media-upload.service';
import { resolveOptionalMediaUrl } from '../services/media-serving.service';

const obtenerParamNumerico = (valor: string | string[] | undefined) => {
  const normalizado = Array.isArray(valor) ? valor[0] : valor;

  if (!normalizado) {
    return NaN;
  }

  return parseInt(normalizado, 10);
};

const normalizarNumero = (valor: unknown) => {
  if (typeof valor === 'number') {
    return valor;
  }

  if (typeof valor === 'string') {
    return parseFloat(valor.replace(',', '.'));
  }

  return NaN;
};

const normalizarBooleanoOpcional = (valor: unknown) => {
  if (valor == null || valor === '') {
    return null;
  }

  if (typeof valor === 'boolean') {
    return valor;
  }

  if (typeof valor === 'string') {
    const normalizado = valor.trim().toLowerCase();
    if (['true', '1', 'si', 'sí'].includes(normalizado)) {
      return true;
    }
    if (['false', '0', 'no'].includes(normalizado)) {
      return false;
    }
  }

  throw new Error('deducible_previsto debe ser booleano.');
};

const normalizarRepartoManual = (valor: unknown) => {
  if (valor == null || valor === '') {
    return undefined;
  }

  const reparto = typeof valor === 'string' ? JSON.parse(valor) : valor;

  if (!Array.isArray(reparto)) {
    throw new Error('repartoManual debe ser un array.');
  }

  return reparto.map((linea) => ({
    usuario_id: normalizarNumero(linea.usuario_id),
    importe: normalizarNumero(linea.importe),
  }));
};

const obtenerValorFiscal = (body: Record<string, unknown>, snake: string, camel: string) =>
  body[snake] ?? body[camel];

const tieneMetadataFiscalEnBody = (body: Record<string, unknown>) =>
  [
    'categoria_fiscal',
    'categoriaFiscal',
    'deducible_previsto',
    'deduciblePrevisto',
    'notas_fiscales',
    'notasFiscales',
    'prorrateo_fiscal',
    'prorrateoFiscal',
  ].some((campo) => Object.prototype.hasOwnProperty.call(body, campo));

const normalizarMetadataFiscal = (body: Record<string, unknown>): MetadataFiscalGastoInput | undefined => {
  if (!tieneMetadataFiscalEnBody(body)) {
    return undefined;
  }

  const categoria = obtenerValorFiscal(body, 'categoria_fiscal', 'categoriaFiscal');
  const deducible = obtenerValorFiscal(body, 'deducible_previsto', 'deduciblePrevisto');
  const notas = obtenerValorFiscal(body, 'notas_fiscales', 'notasFiscales');
  const prorrateo = obtenerValorFiscal(body, 'prorrateo_fiscal', 'prorrateoFiscal');
  const metadata: MetadataFiscalGastoInput = {};

  if (categoria !== undefined && categoria !== null && categoria !== '') {
    if (!esCategoriaFiscalGasto(categoria)) {
      throw new Error('categoria_fiscal no es una categoria fiscal valida.');
    }

    metadata.categoriaFiscal = categoria as CategoriaFiscalGastoRoomies;
  }

  if (deducible !== undefined) {
    metadata.deduciblePrevisto = normalizarBooleanoOpcional(deducible);
  }

  if (notas !== undefined) {
    if (notas == null || notas === '') {
      metadata.notasFiscales = null;
    } else if (typeof notas !== 'string') {
      throw new Error('notas_fiscales debe ser texto.');
    } else {
      const notasNormalizadas = notas.trim();
      if (notasNormalizadas.length > 1000) {
        throw new Error('notas_fiscales no puede superar 1000 caracteres.');
      }
      metadata.notasFiscales = notasNormalizadas || null;
    }
  }

  if (prorrateo !== undefined) {
    if (prorrateo == null || prorrateo === '') {
      metadata.prorrateoFiscal = null;
    } else {
      const prorrateoNormalizado = normalizarNumero(prorrateo);
      if (!Number.isFinite(prorrateoNormalizado) || prorrateoNormalizado < 0 || prorrateoNormalizado > 100) {
        throw new Error('prorrateo_fiscal debe estar entre 0 y 100.');
      }
      metadata.prorrateoFiscal = prorrateoNormalizado;
    }
  }

  return metadata;
};

const construirActualizacionFiscal = (metadataFiscal?: MetadataFiscalGastoInput) => {
  if (!metadataFiscal) {
    return {};
  }

  return {
    ...(metadataFiscal.categoriaFiscal !== undefined
      ? { categoria_fiscal: metadataFiscal.categoriaFiscal }
      : {}),
    ...(metadataFiscal.deduciblePrevisto !== undefined
      ? { deducible_previsto: metadataFiscal.deduciblePrevisto }
      : {}),
    ...(metadataFiscal.notasFiscales !== undefined ? { notas_fiscales: metadataFiscal.notasFiscales } : {}),
    ...(metadataFiscal.prorrateoFiscal !== undefined
      ? { prorrateo_fiscal: metadataFiscal.prorrateoFiscal }
      : {}),
  };
};

const ocultarMetadataFiscal = <T extends Record<string, unknown>>(gasto: T) => {
  const {
    categoria_fiscal: _categoriaFiscal,
    deducible_previsto: _deduciblePrevisto,
    notas_fiscales: _notasFiscales,
    prorrateo_fiscal: _prorrateoFiscal,
    ...gastoPublico
  } = gasto;

  return gastoPublico;
};

const usuarioPuedeAccederAVivienda = async (viviendaId: number, usuarioId: number) => {
  const [habitacion, vivienda] = await Promise.all([
    usuarioPerteneceAVivienda(viviendaId, usuarioId),
    usuarioEsCaseroDeVivienda(viviendaId, usuarioId),
  ]);

  return Boolean(habitacion || vivienda);
};

async function resolverFacturaGasto<T extends {
  factura_url?: string | null;
  factura_provider?: string | null;
  factura_key?: string | null;
}>(gasto: T): Promise<T> {
  const {
    factura_provider: _facturaProvider,
    factura_key: _facturaKey,
    ...gastoPublico
  } = gasto;
  const tieneFactura = Boolean(gasto.factura_url || gasto.factura_provider || gasto.factura_key);
  const exponeFacturaUrl = Object.prototype.hasOwnProperty.call(gasto, 'factura_url') || tieneFactura;

  const gastoConFactura = {
    ...gastoPublico,
    ...(exponeFacturaUrl
      ? {
          factura_url: tieneFactura
            ? await resolveOptionalMediaUrl({
                url: gasto.factura_url,
                provider: gasto.factura_provider,
                key: gasto.factura_key,
                purpose: 'expense-invoice',
              })
            : gasto.factura_url ?? null,
        }
      : {}),
  };

  const deudas = (gasto as unknown as {
    deudas?: Array<{
      justificante_url?: string | null;
      justificante_provider?: string | null;
      justificante_key?: string | null;
    }>;
  }).deudas;

  if (Array.isArray(deudas)) {
    return {
      ...gastoConFactura,
      deudas: await Promise.all(deudas.map((deuda) => resolverJustificanteDeuda(deuda))),
    } as unknown as T;
  }

  return gastoConFactura as T;
}

async function resolverJustificanteDeuda<T extends {
  justificante_url?: string | null;
  justificante_provider?: string | null;
  justificante_key?: string | null;
}>(deuda: T): Promise<T> {
  const {
    justificante_provider: _justificanteProvider,
    justificante_key: _justificanteKey,
    ...deudaPublica
  } = deuda;

  return {
    ...deudaPublica,
    justificante_url: await resolveOptionalMediaUrl({
      url: deuda.justificante_url,
      provider: deuda.justificante_provider,
      key: deuda.justificante_key,
      purpose: 'payment-proof',
    }),
  } as T;
}

async function resolverFacturaDeuda<T extends {
  justificante_url?: string | null;
  justificante_provider?: string | null;
  justificante_key?: string | null;
  gasto: {
    factura_url?: string | null;
    factura_provider?: string | null;
    factura_key?: string | null;
  };
}>(deuda: T): Promise<T> {
  return {
    ...(await resolverJustificanteDeuda(deuda)),
    gasto: await resolverFacturaGasto(deuda.gasto),
  };
}

export const listarGastos: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const usuarioId = req.usuario!.id;

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId inválido.' });
    return;
  }

  const [habitacion, viviendaCasero] = await Promise.all([
    usuarioPerteneceAVivienda(viviendaId, usuarioId),
    usuarioEsCaseroDeVivienda(viviendaId, usuarioId),
  ]);
  const pertenece = Boolean(habitacion || viviendaCasero);

  if (!pertenece) {
    res.status(403).json({ error: 'No perteneces a esta vivienda.' });
    return;
  }

  const gastos = await prisma.gasto.findMany({
    where: {
      vivienda_id: viviendaId,
      ...(viviendaCasero
        ? { tipo: { in: [...TIPOS_GASTO_CASERO] } }
        : {
            OR: [
              { pagador_id: usuarioId },
              { deudas: { some: { OR: [{ deudor_id: usuarioId }, { acreedor_id: usuarioId }] } } },
            ],
          }),
    },
    orderBy: { fecha_creacion: 'desc' },
    include: {
      pagador: { select: { id: true, nombre: true, apellidos: true } },
      deudas: viviendaCasero
        ? true
        : {
            where: {
              OR: [{ deudor_id: usuarioId }, { acreedor_id: usuarioId }],
            },
          },
    },
  });

  const gastosConUrls = await Promise.all(gastos.map((gasto) => resolverFacturaGasto(gasto)));

  res.status(200).json(viviendaCasero ? gastosConUrls : gastosConUrls.map((gasto) => ocultarMetadataFiscal(gasto)));
};

export const listarDeudas: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const usuarioId = req.usuario!.id;

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId inválido.' });
    return;
  }

  const pertenece = await usuarioPuedeAccederAVivienda(viviendaId, usuarioId);

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
      gasto:    {
        select: {
          concepto: true,
          tipo: true,
          factura_url: true,
          factura_provider: true,
          factura_key: true,
          factura_variant: true,
          factura_mime_type: true,
          factura_size: true,
        },
      },
    },
    orderBy: { id: 'desc' },
  });

  const deudasConUrls = await Promise.all(deudas.map((deuda) => resolverFacturaDeuda(deuda)));

  res.status(200).json(
    deudasConUrls.map((deuda) => ({
      ...deuda,
      categoria: TIPOS_GASTO_CASERO.includes(deuda.gasto.tipo as (typeof TIPOS_GASTO_CASERO)[number])
        ? 'CASERO'
        : 'COMPANEROS',
    })),
  );
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

  const pertenece = await usuarioPuedeAccederAVivienda(viviendaId, usuarioId);

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

  const {
    justificante_provider: _justificanteProvider,
    justificante_key: _justificanteKey,
    ...actualizadaPublica
  } = actualizada;

  res.status(200).json({
    ...actualizadaPublica,
    justificante_url: await resolveOptionalMediaUrl({
      url: actualizada.justificante_url,
      provider: actualizada.justificante_provider,
      key: actualizada.justificante_key,
      purpose: 'payment-proof',
    }),
  });
};

export const crearGasto: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const pagadorId = req.usuario!.id;

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId inválido.' });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const { concepto, importe, implicadosIds, fecha } = req.body as {
    concepto: string;
    importe: number | string;
    implicadosIds?: number[];
    fecha?: string;
  };
  const importeNormalizado = normalizarNumero(importe);

  if (!concepto || importe == null || !Number.isFinite(importeNormalizado) || importeNormalizado <= 0) {
    res.status(400).json({ error: 'concepto e importe (> 0) son obligatorios.' });
    return;
  }

  let repartoManual: { usuario_id: number; importe: number }[] | undefined;
  try {
    repartoManual = normalizarRepartoManual(req.body.repartoManual);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'repartoManual no es válido.';
    res.status(400).json({ error: mensaje });
    return;
  }

  if (
    repartoManual &&
    repartoManual.some(
      (linea) =>
        !Number.isInteger(linea.usuario_id) ||
        linea.usuario_id <= 0 ||
        !Number.isFinite(linea.importe) ||
        linea.importe < 0,
    )
  ) {
    res.status(400).json({
      error: 'repartoManual debe incluir usuario_id numérico e importe válido no negativo.',
    });
    return;
  }

  if (
    implicadosIds != null &&
    (!Array.isArray(implicadosIds) || implicadosIds.some((id) => !Number.isInteger(id)))
  ) {
    res.status(400).json({ error: 'implicadosIds debe ser un array de IDs numéricos.' });
    return;
  }

  const fechaGasto = fecha ? new Date(fecha) : undefined;
  if (fecha && Number.isNaN(fechaGasto?.getTime())) {
    res.status(400).json({ error: 'fecha debe ser una fecha válida.' });
    return;
  }

  let metadataFiscal: MetadataFiscalGastoInput | undefined;
  try {
    metadataFiscal = normalizarMetadataFiscal(body);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Los metadatos fiscales no son válidos.';
    res.status(400).json({ error: mensaje });
    return;
  }

  if (metadataFiscal && req.usuario!.rol !== 'CASERO') {
    res.status(403).json({ error: 'Solo el casero puede informar metadatos fiscales del gasto.' });
    return;
  }

  // Verificar que el pagador pertenece a la vivienda (es inquilino de alguna habitación)
  const habitacionPagador = await usuarioPuedeAccederAVivienda(viviendaId, pagadorId);

  if (!habitacionPagador) {
    res.status(403).json({ error: 'No perteneces a esta vivienda.' });
    return;
  }

  try {
    const facturaMedia = await uploadDocumentMedia({
      file: req.file,
      purpose: 'expense-invoice',
      visibility: 'private',
      ownerId: req.usuario!.id,
      viviendaId,
    });
    const tipoGasto = req.usuario!.rol === 'CASERO' ? 'FACTURA_PUNTUAL' : 'ENTRE_COMPANEROS';

    if (req.file && !facturaMedia?.key) {
      res.status(500).json({ error: 'No se pudo obtener la referencia de la factura subida.' });
      return;
    }

    const gasto = await crearGastoDividido({
      concepto,
      importe: importeNormalizado,
      tipo: tipoGasto,
      viviendaId,
      pagadorId,
      implicadosIds,
      repartoManual,
      facturaMedia,
      fecha: fechaGasto,
      metadataFiscal,
    });

    res.status(201).json(await resolverFacturaGasto(gasto));
  } catch (error) {
    const mapped = mediaProviderErrorToHttp(error);
    if (mapped.status !== 500) {
      res.status(mapped.status).json({ error: mapped.message });
      return;
    }

    const mensaje = error instanceof Error ? error.message : 'No se pudo registrar el gasto.';
    res.status(400).json({ error: mensaje });
  }
};

export const actualizarGasto: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const gastoId = obtenerParamNumerico(req.params.gastoId);
  const usuarioId = req.usuario!.id;

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId inválido.' });
    return;
  }

  if (!Number.isInteger(gastoId) || gastoId <= 0) {
    res.status(400).json({ error: 'gastoId inválido.' });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const { concepto, importe, fecha } = req.body as {
    concepto?: string;
    importe?: number;
    fecha?: string;
  };

  const datosActualizacion: {
    concepto?: string;
    importe?: number;
    fecha_creacion?: Date;
    fecha_modificacion?: Date;
    modificado_por_id?: number;
    factura_url?: string | null;
    factura_provider?: string | null;
    factura_key?: string | null;
    factura_variant?: string | null;
    factura_mime_type?: string | null;
    factura_size?: number | null;
    categoria_fiscal?: CategoriaFiscalGastoRoomies;
    deducible_previsto?: boolean | null;
    notas_fiscales?: string | null;
    prorrateo_fiscal?: number | null;
  } = {};

  if (concepto !== undefined) {
    if (!concepto.trim()) {
      res.status(400).json({ error: 'El concepto no puede estar vacío.' });
      return;
    }

    datosActualizacion.concepto = concepto.trim();
  }

  if (importe !== undefined) {
    if (typeof importe !== 'number' || !Number.isFinite(importe) || importe <= 0) {
      res.status(400).json({ error: 'El importe debe ser un número mayor que 0.' });
      return;
    }

    datosActualizacion.importe = normalizarImporteMonetario(importe);
  }

  if (fecha !== undefined) {
    const fechaActualizada = new Date(fecha);

    if (Number.isNaN(fechaActualizada.getTime())) {
      res.status(400).json({ error: 'La fecha indicada no es válida.' });
      return;
    }

    datosActualizacion.fecha_creacion = fechaActualizada;
  }

  let metadataFiscal: MetadataFiscalGastoInput | undefined;
  try {
    metadataFiscal = normalizarMetadataFiscal(body);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Los metadatos fiscales no son válidos.';
    res.status(400).json({ error: mensaje });
    return;
  }

  Object.assign(datosActualizacion, construirActualizacionFiscal(metadataFiscal));

  if (Object.keys(datosActualizacion).length === 0) {
    res.status(400).json({ error: 'No hay campos válidos para actualizar.' });
    return;
  }

  const esCasero = await usuarioEsCaseroDeVivienda(viviendaId, usuarioId);

  if (!esCasero) {
    res.status(403).json({ error: 'Solo el casero puede editar facturas de esta vivienda.' });
    return;
  }

  const gasto = await prisma.gasto.findFirst({
    where: { id: gastoId, vivienda_id: viviendaId, tipo: { in: [...TIPOS_GASTO_CASERO] } },
    include: { deudas: true },
  });

  if (!gasto) {
    res.status(404).json({ error: 'Factura no encontrada para esta vivienda.' });
    return;
  }

  const hayPagosRegistrados = gasto.deudas.some((deuda) => deuda.estado === 'PAGADA');
  const actualizaDatosEconomicos =
    datosActualizacion.concepto !== undefined ||
    datosActualizacion.importe !== undefined ||
    datosActualizacion.fecha_creacion !== undefined;

  if (hayPagosRegistrados && actualizaDatosEconomicos) {
    res.status(400).json({
      error: 'Esta factura no puede modificarse porque ya existen pagos registrados.',
    });
    return;
  }

  datosActualizacion.fecha_modificacion = new Date();
  datosActualizacion.modificado_por_id = usuarioId;

  const importeCambia =
    datosActualizacion.importe !== undefined &&
    Number(datosActualizacion.importe.toFixed(2)) !== Number(gasto.importe.toFixed(2));

  const gastoActualizado = await prisma.$transaction(async (tx) => {
    if (importeCambia && gasto.deudas.length > 0) {
      const repartoActualizado = repartirImporteEnCentimos(
        datosActualizacion.importe!,
        gasto.deudas.map((deuda) => deuda.deudor_id),
      );
      const deudaIdPorDeudor = new Map(gasto.deudas.map((deuda) => [deuda.deudor_id, deuda.id]));

      await Promise.all(
        repartoActualizado.map((linea) =>
          tx.deuda.update({
            where: { id: deudaIdPorDeudor.get(linea.usuario_id)! },
            data: { importe: linea.importe },
          }),
        ),
      );
    }

    return tx.gasto.update({
      where: { id: gasto.id },
      data: datosActualizacion,
      include: {
        pagador: { select: { id: true, nombre: true, apellidos: true } },
        modificado_por: { select: { id: true, nombre: true, apellidos: true } },
        deudas: true,
      },
    });
  });

  res.status(200).json(await resolverFacturaGasto(gastoActualizado));
};

export const eliminarGasto: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const gastoId = obtenerParamNumerico(req.params.gastoId);
  const usuarioId = req.usuario!.id;

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId inválido.' });
    return;
  }

  if (!Number.isInteger(gastoId) || gastoId <= 0) {
    res.status(400).json({ error: 'gastoId inválido.' });
    return;
  }

  const esCasero = await usuarioEsCaseroDeVivienda(viviendaId, usuarioId);

  if (!esCasero) {
    res.status(403).json({ error: 'Solo el casero puede borrar facturas de esta vivienda.' });
    return;
  }

  const gasto = await prisma.gasto.findFirst({
    where: { id: gastoId, vivienda_id: viviendaId, tipo: { in: [...TIPOS_GASTO_CASERO] } },
    include: { deudas: true },
  });

  if (!gasto) {
    res.status(404).json({ error: 'Factura no encontrada para esta vivienda.' });
    return;
  }

  if (gasto.tipo !== 'FACTURA_PUNTUAL') {
    res.status(400).json({
      error: 'Solo se pueden borrar facturas puntuales creadas manualmente.',
    });
    return;
  }

  const tieneActividadDePago = gasto.deudas.some(
    (deuda) => deuda.estado === 'PAGADA' || Boolean(deuda.justificante_url) || Boolean(deuda.justificante_key),
  );

  if (tieneActividadDePago) {
    res.status(400).json({
      error: 'Esta factura no puede borrarse porque ya tiene actividad de pago asociada.',
    });
    return;
  }

  await prisma.gasto.delete({
    where: { id: gasto.id },
  });
  const cleanup = await cleanupMediaReferences([{
    provider: gasto.factura_provider,
    key: gasto.factura_key,
    variant: gasto.factura_variant,
  }], {
    includeImageVariants: true,
    context: `gasto:${gasto.id}:delete`,
  });

  res.status(200).json({
    ok: true,
    gasto_id: gasto.id,
    ...(cleanup.failed.length > 0 ? { media_cleanup_pending: true } : {}),
  });
};

export const subirFacturaGasto: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const gastoId = obtenerParamNumerico(req.params.gastoId);
  const usuarioId = req.usuario!.id;

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId inválido.' });
    return;
  }

  if (!Number.isInteger(gastoId) || gastoId <= 0) {
    res.status(400).json({ error: 'gastoId inválido.' });
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
    where: { id: gastoId, vivienda_id: viviendaId, tipo: { in: [...TIPOS_GASTO_CASERO] } },
    include: { deudas: true },
  });

  if (!gasto) {
    res.status(404).json({ error: 'Factura no encontrada para esta vivienda.' });
    return;
  }

  if (gasto.deudas.some((deuda) => deuda.estado === 'PAGADA')) {
    res.status(400).json({
      error: 'Esta factura no puede modificarse porque ya existen pagos registrados.',
    });
    return;
  }

  let facturaMedia;
  try {
    facturaMedia = await uploadImageMedia({
      file: req.file,
      purpose: 'expense-invoice',
      visibility: 'private',
      ownerId: usuarioId,
      viviendaId,
      preferredVariant: 'medium',
    });
  } catch (error) {
    const mapped = mediaProviderErrorToHttp(error);
    res.status(mapped.status).json({ error: mapped.message });
    return;
  }

  if (!facturaMedia?.key) {
    res.status(500).json({ error: 'No se pudo obtener la referencia de la factura subida.' });
    return;
  }

  const gastoActualizado = await prisma.gasto.update({
    where: { id: gasto.id },
    data: {
      ...construirCamposMediaDocumento('factura', facturaMedia),
      fecha_modificacion: new Date(),
      modificado_por_id: usuarioId,
    },
    include: {
      pagador: { select: { id: true, nombre: true, apellidos: true } },
      modificado_por: { select: { id: true, nombre: true, apellidos: true } },
      deudas: true,
    },
  });
  await cleanupMediaReferences([{
    provider: gasto.factura_provider,
    key: gasto.factura_key,
    variant: gasto.factura_variant,
  }], {
    includeImageVariants: true,
    context: `gasto:${gasto.id}:replace-factura`,
  });

  res.status(201).json(await resolverFacturaGasto(gastoActualizado));
};
