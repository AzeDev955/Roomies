import crypto from 'node:crypto';
import express from 'express';
import { RolUsuario } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';
import {
  construirCamposMediaDocumento,
} from '../services/media-reference.service';
import { mediaProviderErrorToHttp, uploadDocumentMedia } from '../services/media-upload.service';
import { resolveOptionalMediaUrl } from '../services/media-url.service';
import { registrarPeriodoContratoFirmado } from '../services/ocupacion.service';

const ESTADOS_CONTRATO = {
  BORRADOR: 'BORRADOR',
  PENDIENTE_FIRMA: 'PENDIENTE_FIRMA',
  FIRMADO: 'FIRMADO',
  RECHAZADO: 'RECHAZADO',
  ANULADO: 'ANULADO',
} as const;

const EVENTOS_CONTRATO = {
  CREADO: 'CREADO',
  ENVIADO_FIRMA: 'ENVIADO_FIRMA',
  FIRMADO: 'FIRMADO',
  RECHAZADO: 'RECHAZADO',
  ANULADO: 'ANULADO',
} as const;

const db = prisma as typeof prisma & {
  contratoAlquiler: any;
  eventoContratoAlquiler: any;
};

const obtenerParamNumerico = (valor: string | string[] | undefined) => {
  const normalizado = Array.isArray(valor) ? valor[0] : valor;
  if (!normalizado) return NaN;
  return parseInt(normalizado, 10);
};

const normalizarNumero = (valor: unknown) => {
  if (typeof valor === 'number') return valor;
  if (typeof valor === 'string') return parseFloat(valor.replace(',', '.'));
  return NaN;
};

const normalizarFecha = (valor: unknown) => {
  if (typeof valor !== 'string' || !valor.trim()) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const normalizarBooleano = (valor: unknown, defecto: boolean) => {
  if (valor === undefined || valor === null || valor === '') return defecto;
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'string') {
    const normalizado = valor.trim().toLowerCase();
    if (['true', '1', 'si', 's'].includes(normalizado)) return true;
    if (['false', '0', 'no', 'n'].includes(normalizado)) return false;
  }
  return defecto;
};

const calcularHashDocumento = (file: Express.Multer.File) => {
  const fuente =
    file.buffer && file.buffer.length > 0
      ? file.buffer
      : Buffer.from(
          [
            (file as Express.Multer.File & { path?: string }).path ?? '',
            file.originalname,
            file.mimetype,
            file.size,
          ].join('|'),
        );

  return crypto.createHash('sha256').update(fuente).digest('hex');
};

const origenTecnico = (req: express.Request) =>
  [
    req.ip ? `ip=${req.ip}` : null,
    typeof req.headers['user-agent'] === 'string' ? `ua=${req.headers['user-agent'].slice(0, 180)}` : null,
  ]
    .filter(Boolean)
    .join('; ');

const includeContrato = {
  vivienda: {
    select: {
      id: true,
      alias_nombre: true,
      direccion: true,
      ciudad: true,
      provincia: true,
    },
  },
  habitacion: {
    select: {
      id: true,
      nombre: true,
      tipo: true,
    },
  },
  casero: {
    select: {
      id: true,
      nombre: true,
      apellidos: true,
    },
  },
  inquilino: {
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      documento_identidad: true,
    },
  },
  eventos: {
    orderBy: { fecha: 'asc' },
    select: {
      id: true,
      tipo: true,
      estado_desde: true,
      estado_hasta: true,
      fecha: true,
      usuario: {
        select: {
          id: true,
          nombre: true,
          apellidos: true,
        },
      },
    },
  },
};

const obtenerContratoAccesible = async (contratoId: number, usuarioId: number, rol: RolUsuario) =>
  db.contratoAlquiler.findFirst({
    where: {
      id: contratoId,
      ...(rol === RolUsuario.CASERO ? { casero_id: usuarioId } : { inquilino_id: usuarioId }),
    },
    include: includeContrato,
  });

const validarViviendaCasero = async (viviendaId: number, caseroId: number) =>
  prisma.vivienda.findFirst({
    where: { id: viviendaId, casero_id: caseroId },
    select: {
      id: true,
      habitaciones: {
        select: {
          id: true,
          inquilino_id: true,
          precio: true,
          es_habitable: true,
        },
      },
    },
  });

async function resolverDocumentoContrato<T extends {
  documento_url?: string | null;
  documento_provider?: string | null;
  documento_key?: string | null;
}>(contrato: T | null): Promise<T | null> {
  if (!contrato) {
    return contrato;
  }

  return {
    ...contrato,
    documento_url: await resolveOptionalMediaUrl({
      url: contrato.documento_url,
      provider: contrato.documento_provider,
      key: contrato.documento_key,
      visibility: 'private',
    }),
  };
}

export const listarContratosVivienda: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const usuario = req.usuario!;

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId invalido.' });
    return;
  }

  const vivienda =
    usuario.rol === RolUsuario.CASERO
      ? await prisma.vivienda.findFirst({ where: { id: viviendaId, casero_id: usuario.id }, select: { id: true } })
      : await prisma.habitacion.findFirst({
          where: { vivienda_id: viviendaId, inquilino_id: usuario.id },
          select: { id: true },
        });

  if (!vivienda) {
    res.status(403).json({ error: 'No tienes acceso a los contratos de esta vivienda.' });
    return;
  }

  const contratos = await db.contratoAlquiler.findMany({
    where: {
      vivienda_id: viviendaId,
      ...(usuario.rol === RolUsuario.INQUILINO ? { inquilino_id: usuario.id } : {}),
    },
    orderBy: [{ fecha_creacion: 'desc' }, { id: 'desc' }],
    include: includeContrato,
  });

  res.status(200).json(await Promise.all(contratos.map((contrato: any) => resolverDocumentoContrato(contrato))));
};

export const crearContratoAlquiler: express.RequestHandler = async (req, res) => {
  const viviendaId = obtenerParamNumerico(req.params.viviendaId);
  const usuario = req.usuario!;

  if (usuario.rol !== RolUsuario.CASERO) {
    res.status(403).json({ error: 'Solo el casero puede subir contratos de alquiler.' });
    return;
  }

  if (!Number.isInteger(viviendaId) || viviendaId <= 0) {
    res.status(400).json({ error: 'viviendaId invalido.' });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: 'Debes adjuntar el contrato en PDF o imagen.' });
    return;
  }

  const vivienda = await validarViviendaCasero(viviendaId, usuario.id);
  if (!vivienda) {
    res.status(403).json({ error: 'No tienes permiso para gestionar contratos de esta vivienda.' });
    return;
  }

  const inquilinoId = normalizarNumero(req.body.inquilino_id ?? req.body.inquilinoId);
  const habitacionIdRaw = req.body.habitacion_id ?? req.body.habitacionId;
  const habitacionId = habitacionIdRaw == null || habitacionIdRaw === '' ? null : normalizarNumero(habitacionIdRaw);
  const rentaMensual = normalizarNumero(req.body.renta_mensual ?? req.body.rentaMensual);
  const fechaInicio = normalizarFecha(req.body.fecha_inicio ?? req.body.fechaInicio);
  const fechaFinRaw = req.body.fecha_fin ?? req.body.fechaFin;
  const fechaFin = fechaFinRaw == null || fechaFinRaw === '' ? null : normalizarFecha(fechaFinRaw);
  const notas = typeof req.body.notas === 'string' && req.body.notas.trim() ? req.body.notas.trim() : null;
  const enviarAFirma = normalizarBooleano(req.body.enviarAFirma ?? req.body.enviar_a_firma, true);

  if (!Number.isInteger(inquilinoId) || inquilinoId <= 0) {
    res.status(400).json({ error: 'inquilino_id es obligatorio.' });
    return;
  }

  if (habitacionId !== null && (!Number.isInteger(habitacionId) || habitacionId <= 0)) {
    res.status(400).json({ error: 'habitacion_id invalido.' });
    return;
  }

  if (!Number.isFinite(rentaMensual) || rentaMensual <= 0) {
    res.status(400).json({ error: 'renta_mensual debe ser mayor que 0.' });
    return;
  }

  if (!fechaInicio) {
    res.status(400).json({ error: 'fecha_inicio debe ser una fecha valida.' });
    return;
  }

  if (fechaFinRaw && !fechaFin) {
    res.status(400).json({ error: 'fecha_fin debe ser una fecha valida.' });
    return;
  }

  const habitacionContrato =
    habitacionId === null
      ? vivienda.habitaciones.find((habitacion) => habitacion.inquilino_id === inquilinoId)
      : vivienda.habitaciones.find((habitacion) => habitacion.id === habitacionId);

  if (!habitacionContrato || habitacionContrato.inquilino_id !== inquilinoId) {
    res.status(400).json({ error: 'El inquilino debe estar asignado a la vivienda o habitacion indicada.' });
    return;
  }

  let documentoMedia;
  try {
    documentoMedia = await uploadDocumentMedia({
      file: req.file,
      purpose: 'rental-contract',
      visibility: 'private',
      ownerId: usuario.id,
      viviendaId,
    });
  } catch (error) {
    const mapped = mediaProviderErrorToHttp(error);
    res.status(mapped.status).json({ error: mapped.message });
    return;
  }

  if (!documentoMedia?.key) {
    res.status(500).json({ error: 'No se pudo obtener la referencia del contrato subido.' });
    return;
  }

  const estadoInicial = enviarAFirma ? ESTADOS_CONTRATO.PENDIENTE_FIRMA : ESTADOS_CONTRATO.BORRADOR;
  const ahora = new Date();
  const versionAnterior = await db.contratoAlquiler.aggregate({
    where: {
      vivienda_id: viviendaId,
      habitacion_id: habitacionContrato.id,
      inquilino_id: inquilinoId,
    },
    _max: { version: true },
  });

  const contrato = await db.$transaction(async (tx: any) => {
    const creado = await tx.contratoAlquiler.create({
      data: {
        vivienda_id: viviendaId,
        habitacion_id: habitacionContrato.id,
        casero_id: usuario.id,
        inquilino_id: inquilinoId,
        version: (versionAnterior._max.version ?? 0) + 1,
        estado: estadoInicial,
        ...construirCamposMediaDocumento('documento', documentoMedia),
        documento_nombre: req.file?.originalname ?? null,
        documento_hash: calcularHashDocumento(req.file!),
        renta_mensual: rentaMensual,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        notas,
        enviado_en: enviarAFirma ? ahora : null,
      },
    });

    await tx.eventoContratoAlquiler.create({
      data: {
        contrato_id: creado.id,
        usuario_id: usuario.id,
        tipo: enviarAFirma ? EVENTOS_CONTRATO.ENVIADO_FIRMA : EVENTOS_CONTRATO.CREADO,
        estado_hasta: estadoInicial,
        origen_tecnico: origenTecnico(req),
        metadata: {
          documento_nombre: req.file?.originalname ?? null,
          documento_mime: documentoMedia.mimeType,
          documento_provider: documentoMedia.provider,
          documento_key: documentoMedia.key,
          documento_hash: creado.documento_hash,
        },
      },
    });

    return tx.contratoAlquiler.findUnique({
      where: { id: creado.id },
      include: includeContrato,
    });
  });

  res.status(201).json(await resolverDocumentoContrato(contrato));
};

export const firmarContratoAlquiler: express.RequestHandler = async (req, res) => {
  const contratoId = obtenerParamNumerico(req.params.contratoId);
  const usuario = req.usuario!;

  if (usuario.rol !== RolUsuario.INQUILINO) {
    res.status(403).json({ error: 'Solo el inquilino implicado puede firmar el contrato.' });
    return;
  }

  if (!Number.isInteger(contratoId) || contratoId <= 0) {
    res.status(400).json({ error: 'contratoId invalido.' });
    return;
  }

  const contrato = await obtenerContratoAccesible(contratoId, usuario.id, usuario.rol);
  if (!contrato) {
    res.status(404).json({ error: 'Contrato no encontrado.' });
    return;
  }

  if (contrato.estado !== ESTADOS_CONTRATO.PENDIENTE_FIRMA) {
    res.status(409).json({ error: 'Solo se pueden firmar contratos pendientes de firma.' });
    return;
  }

  const ahora = new Date();
  const origen = origenTecnico(req);
  const contratoActualizado = await db.$transaction(async (tx: any) => {
    await tx.eventoContratoAlquiler.create({
      data: {
        contrato_id: contrato.id,
        usuario_id: usuario.id,
        tipo: EVENTOS_CONTRATO.FIRMADO,
        estado_desde: contrato.estado,
        estado_hasta: ESTADOS_CONTRATO.FIRMADO,
        origen_tecnico: origen,
        metadata: {
          documento_hash: contrato.documento_hash,
          version: contrato.version,
        },
      },
    });

    const actualizado = await tx.contratoAlquiler.update({
      where: { id: contrato.id },
      data: {
        estado: ESTADOS_CONTRATO.FIRMADO,
        firmado_en: ahora,
        firma_usuario_id: usuario.id,
        firma_documento_identidad: contrato.inquilino.documento_identidad ?? null,
        firma_origen_tecnico: origen,
      },
      include: includeContrato,
    });

    await registrarPeriodoContratoFirmado(tx, {
      id: contrato.id,
      vivienda_id: contrato.vivienda.id,
      habitacion_id: contrato.habitacion?.id ?? null,
      inquilino_id: usuario.id,
      fecha_inicio: contrato.fecha_inicio,
      fecha_fin: contrato.fecha_fin,
      renta_mensual: contrato.renta_mensual,
    });

    return actualizado;
  });

  res.status(200).json(contratoActualizado);
};

export const rechazarContratoAlquiler: express.RequestHandler = async (req, res) => {
  const contratoId = obtenerParamNumerico(req.params.contratoId);
  const usuario = req.usuario!;

  if (usuario.rol !== RolUsuario.INQUILINO) {
    res.status(403).json({ error: 'Solo el inquilino implicado puede rechazar el contrato.' });
    return;
  }

  if (!Number.isInteger(contratoId) || contratoId <= 0) {
    res.status(400).json({ error: 'contratoId invalido.' });
    return;
  }

  const contrato = await obtenerContratoAccesible(contratoId, usuario.id, usuario.rol);
  if (!contrato) {
    res.status(404).json({ error: 'Contrato no encontrado.' });
    return;
  }

  if (contrato.estado !== ESTADOS_CONTRATO.PENDIENTE_FIRMA) {
    res.status(409).json({ error: 'Solo se pueden rechazar contratos pendientes de firma.' });
    return;
  }

  const motivo = typeof req.body.motivo === 'string' && req.body.motivo.trim() ? req.body.motivo.trim() : null;
  const contratoActualizado = await db.$transaction(async (tx: any) => {
    await tx.eventoContratoAlquiler.create({
      data: {
        contrato_id: contrato.id,
        usuario_id: usuario.id,
        tipo: EVENTOS_CONTRATO.RECHAZADO,
        estado_desde: contrato.estado,
        estado_hasta: ESTADOS_CONTRATO.RECHAZADO,
        origen_tecnico: origenTecnico(req),
        metadata: { motivo },
      },
    });

    return tx.contratoAlquiler.update({
      where: { id: contrato.id },
      data: {
        estado: ESTADOS_CONTRATO.RECHAZADO,
        rechazado_en: new Date(),
      },
      include: includeContrato,
    });
  });

  res.status(200).json(contratoActualizado);
};

export const anularContratoAlquiler: express.RequestHandler = async (req, res) => {
  const contratoId = obtenerParamNumerico(req.params.contratoId);
  const usuario = req.usuario!;

  if (usuario.rol !== RolUsuario.CASERO) {
    res.status(403).json({ error: 'Solo el casero puede anular contratos.' });
    return;
  }

  if (!Number.isInteger(contratoId) || contratoId <= 0) {
    res.status(400).json({ error: 'contratoId invalido.' });
    return;
  }

  const contrato = await obtenerContratoAccesible(contratoId, usuario.id, usuario.rol);
  if (!contrato) {
    res.status(404).json({ error: 'Contrato no encontrado.' });
    return;
  }

  if ([ESTADOS_CONTRATO.FIRMADO, ESTADOS_CONTRATO.ANULADO].includes(contrato.estado)) {
    res.status(409).json({ error: 'No se puede anular un contrato firmado o ya anulado.' });
    return;
  }

  const contratoActualizado = await db.$transaction(async (tx: any) => {
    await tx.eventoContratoAlquiler.create({
      data: {
        contrato_id: contrato.id,
        usuario_id: usuario.id,
        tipo: EVENTOS_CONTRATO.ANULADO,
        estado_desde: contrato.estado,
        estado_hasta: ESTADOS_CONTRATO.ANULADO,
        origen_tecnico: origenTecnico(req),
      },
    });

    return tx.contratoAlquiler.update({
      where: { id: contrato.id },
      data: {
        estado: ESTADOS_CONTRATO.ANULADO,
        anulado_en: new Date(),
      },
      include: includeContrato,
    });
  });

  res.status(200).json(contratoActualizado);
};
