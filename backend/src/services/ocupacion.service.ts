import { prisma } from '../lib/prisma';

export const ESTADOS_PERIODO_OCUPACION = {
  ACTIVO: 'ACTIVO',
  FINALIZADO: 'FINALIZADO',
  PENDIENTE_REVISION: 'PENDIENTE_REVISION',
} as const;

export const ORIGENES_PERIODO_OCUPACION = {
  CONTRATO_FIRMADO: 'CONTRATO_FIRMADO',
  ALTA_MANUAL: 'ALTA_MANUAL',
  INFERIDO_CARGO_ALQUILER: 'INFERIDO_CARGO_ALQUILER',
  MIGRADO: 'MIGRADO',
} as const;

type DbPeriodo = typeof prisma & {
  periodoOcupacion: any;
};

type OrigenPeriodoOcupacion = (typeof ORIGENES_PERIODO_OCUPACION)[keyof typeof ORIGENES_PERIODO_OCUPACION];

type RegistrarAltaInput = {
  viviendaId: number;
  habitacionId: number | null;
  inquilinoId: number;
  fechaInicio?: Date;
  fechaFin?: Date | null;
  origen?: OrigenPeriodoOcupacion;
  contratoId?: number | null;
  rentaMensual?: number | null;
  requiereRevision?: boolean;
  notas?: string | null;
};

type RegistrarBajaInput = {
  viviendaId: number;
  habitacionId?: number | null;
  inquilinoId: number;
  fechaFin?: Date;
  notas?: string | null;
};

type CargoAlquilerInferible = {
  id: number;
  vivienda_id: number;
  habitacion_cargo_id: number | null;
  inquilino_cargo_id: number | null;
  importe: number;
  periodo_facturacion: string | null;
};

const db = prisma as DbPeriodo;

const inicioMes = (periodo: string) => {
  const match = /^(\d{4})-(\d{2})$/.exec(periodo);
  if (!match) return null;
  const ano = Number(match[1]);
  const mes = Number(match[2]);
  if (!Number.isInteger(ano) || !Number.isInteger(mes) || mes < 1 || mes > 12) return null;
  return new Date(Date.UTC(ano, mes - 1, 1));
};

const mesSiguiente = (fecha: Date) => new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, 1));

const esMismoMes = (a: Date, b: Date) =>
  a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();

const estadoDesdeFechas = (fechaInicio: Date, fechaFin: Date | null | undefined, requiereRevision: boolean) => {
  if (requiereRevision) return ESTADOS_PERIODO_OCUPACION.PENDIENTE_REVISION;
  return fechaFin && fechaFin > fechaInicio ? ESTADOS_PERIODO_OCUPACION.FINALIZADO : ESTADOS_PERIODO_OCUPACION.ACTIVO;
};

export const registrarAltaOcupacion = async (
  tx: DbPeriodo,
  {
    viviendaId,
    habitacionId,
    inquilinoId,
    fechaInicio = new Date(),
    fechaFin = null,
    origen = ORIGENES_PERIODO_OCUPACION.ALTA_MANUAL,
    contratoId = null,
    rentaMensual = null,
    requiereRevision = false,
    notas = null,
  }: RegistrarAltaInput,
) => {
  const existente = await tx.periodoOcupacion.findFirst({
    where: {
      vivienda_id: viviendaId,
      habitacion_id: habitacionId,
      inquilino_id: inquilinoId,
      fecha_fin: null,
      estado: ESTADOS_PERIODO_OCUPACION.ACTIVO,
    },
  });

  if (existente) {
    if (contratoId || origen === ORIGENES_PERIODO_OCUPACION.CONTRATO_FIRMADO) {
      return tx.periodoOcupacion.update({
        where: { id: existente.id },
        data: {
          contrato_id: contratoId,
          origen,
          fecha_inicio: fechaInicio < existente.fecha_inicio ? fechaInicio : existente.fecha_inicio,
          fecha_fin: fechaFin,
          estado: estadoDesdeFechas(fechaInicio, fechaFin, requiereRevision),
          renta_mensual: rentaMensual ?? existente.renta_mensual,
          requiere_revision: requiereRevision,
          notas,
        },
      });
    }

    return existente;
  }

  await tx.periodoOcupacion.updateMany({
    where: {
      vivienda_id: viviendaId,
      inquilino_id: inquilinoId,
      fecha_fin: null,
      estado: ESTADOS_PERIODO_OCUPACION.ACTIVO,
    },
    data: {
      fecha_fin: fechaInicio,
      estado: ESTADOS_PERIODO_OCUPACION.FINALIZADO,
      notas: 'Cerrado automaticamente al abrir un nuevo periodo de ocupacion.',
    },
  });

  await tx.periodoOcupacion.updateMany({
    where: {
      vivienda_id: viviendaId,
      habitacion_id: habitacionId,
      fecha_fin: null,
      estado: ESTADOS_PERIODO_OCUPACION.ACTIVO,
    },
    data: {
      fecha_fin: fechaInicio,
      estado: ESTADOS_PERIODO_OCUPACION.FINALIZADO,
      notas: 'Cerrado automaticamente al reocupar la habitacion.',
    },
  });

  return tx.periodoOcupacion.create({
    data: {
      vivienda_id: viviendaId,
      habitacion_id: habitacionId,
      inquilino_id: inquilinoId,
      contrato_id: contratoId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      estado: estadoDesdeFechas(fechaInicio, fechaFin, requiereRevision),
      origen,
      renta_mensual: rentaMensual,
      requiere_revision: requiereRevision,
      notas,
    },
  });
};

export const registrarBajaOcupacion = async (
  tx: DbPeriodo,
  { viviendaId, habitacionId, inquilinoId, fechaFin = new Date(), notas = null }: RegistrarBajaInput,
) =>
  tx.periodoOcupacion.updateMany({
    where: {
      vivienda_id: viviendaId,
      inquilino_id: inquilinoId,
      ...(habitacionId !== undefined ? { habitacion_id: habitacionId } : {}),
      fecha_fin: null,
      estado: ESTADOS_PERIODO_OCUPACION.ACTIVO,
    },
    data: {
      fecha_fin: fechaFin,
      estado: ESTADOS_PERIODO_OCUPACION.FINALIZADO,
      ...(notas ? { notas } : {}),
    },
  });

export const registrarPeriodoContratoFirmado = async (
  tx: DbPeriodo,
  contrato: {
    id: number;
    vivienda_id: number;
    habitacion_id: number | null;
    inquilino_id: number;
    fecha_inicio: Date;
    fecha_fin: Date | null;
    renta_mensual: number;
  },
) =>
  registrarAltaOcupacion(tx, {
    viviendaId: contrato.vivienda_id,
    habitacionId: contrato.habitacion_id,
    inquilinoId: contrato.inquilino_id,
    fechaInicio: contrato.fecha_inicio,
    fechaFin: contrato.fecha_fin,
    origen: ORIGENES_PERIODO_OCUPACION.CONTRATO_FIRMADO,
    contratoId: contrato.id,
    rentaMensual: contrato.renta_mensual,
  });

export const inferirPeriodosOcupacionDesdeCargos = (cargos: CargoAlquilerInferible[]) => {
  const validos = cargos
    .map((cargo) => ({ cargo, inicio: cargo.periodo_facturacion ? inicioMes(cargo.periodo_facturacion) : null }))
    .filter(
      (item): item is { cargo: CargoAlquilerInferible; inicio: Date } =>
        !!item.inicio && item.cargo.habitacion_cargo_id !== null && item.cargo.inquilino_cargo_id !== null,
    )
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime() || a.cargo.id - b.cargo.id);

  const periodos: Array<{
    vivienda_id: number;
    habitacion_id: number;
    inquilino_id: number;
    fecha_inicio: Date;
    fecha_fin: Date;
    estado: typeof ESTADOS_PERIODO_OCUPACION.PENDIENTE_REVISION;
    origen: typeof ORIGENES_PERIODO_OCUPACION.INFERIDO_CARGO_ALQUILER;
    renta_mensual: number;
    requiere_revision: true;
    notas: string;
    gasto_ids: number[];
  }> = [];

  for (const { cargo, inicio } of validos) {
    const habitacionId = cargo.habitacion_cargo_id!;
    const inquilinoId = cargo.inquilino_cargo_id!;
    const ultimo = periodos.length > 0 ? periodos[periodos.length - 1] : undefined;
    const fin = mesSiguiente(inicio);

    if (
      ultimo &&
      ultimo.vivienda_id === cargo.vivienda_id &&
      ultimo.habitacion_id === habitacionId &&
      ultimo.inquilino_id === inquilinoId &&
      esMismoMes(ultimo.fecha_fin, inicio)
    ) {
      ultimo.fecha_fin = fin;
      ultimo.gasto_ids.push(cargo.id);
      ultimo.renta_mensual = cargo.importe;
      continue;
    }

    periodos.push({
      vivienda_id: cargo.vivienda_id,
      habitacion_id: habitacionId,
      inquilino_id: inquilinoId,
      fecha_inicio: inicio,
      fecha_fin: fin,
      estado: ESTADOS_PERIODO_OCUPACION.PENDIENTE_REVISION,
      origen: ORIGENES_PERIODO_OCUPACION.INFERIDO_CARGO_ALQUILER,
      renta_mensual: cargo.importe,
      requiere_revision: true,
      notas: 'Periodo inferido desde cargos ALQUILER_HABITACION; revisar fechas reales de alta y baja.',
      gasto_ids: [cargo.id],
    });
  }

  return periodos;
};

export const crearPeriodosMigradosDesdeEstadoActual = async (fechaInicio = new Date()) => {
  const habitaciones = await prisma.habitacion.findMany({
    where: { inquilino_id: { not: null }, tipo: 'DORMITORIO', es_habitable: true },
    select: { id: true, vivienda_id: true, inquilino_id: true, precio: true },
  });

  return db.$transaction((tx) =>
    Promise.all(
      habitaciones.map((habitacion) =>
        registrarAltaOcupacion(tx as any, {
          viviendaId: habitacion.vivienda_id,
          habitacionId: habitacion.id,
          inquilinoId: habitacion.inquilino_id!,
          fechaInicio,
          origen: ORIGENES_PERIODO_OCUPACION.MIGRADO,
          rentaMensual: habitacion.precio,
          requiereRevision: true,
          notas: 'Periodo migrado desde la ocupacion actual; revisar fecha real de entrada.',
        }),
      ),
    ),
  );
};
