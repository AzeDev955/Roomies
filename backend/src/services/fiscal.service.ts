import { prisma } from '../lib/prisma';
import { aCentimos, desdeCentimos, normalizarImporteMonetario } from './gasto.service';

type InquilinoFiscal = {
  id: number;
  nombre: string;
  apellidos: string | null;
  documento_identidad?: string | null;
};

type HabitacionFiscal = {
  id: number;
  nombre: string;
  tipo: string;
  es_habitable: boolean;
  precio: number | null;
  inquilino_id: number | null;
  inquilino?: InquilinoFiscal | null;
};

type GastoFiscal = {
  id: number;
  concepto: string;
  importe: number;
  tipo: string;
  fecha_creacion: Date;
  periodo_facturacion: string | null;
  habitacion_cargo_id: number | null;
  inquilino_cargo_id: number | null;
  prorrateo_fiscal: number | null;
  inquilino_cargo?: InquilinoFiscal | null;
};

export type FiscalEstadoOcupacion = 'SIN_ACTIVIDAD' | 'PARCIAL' | 'TODO_EL_ANO';

export type FiscalRevision = {
  codigo: 'SIN_PERIODO_FACTURACION' | 'OCUPACION_ACTUAL_SIN_CARGOS' | 'SIN_PRECIO_HABITACION';
  mensaje: string;
};

export type FiscalPeriodoOcupacion = {
  inicio: string;
  fin: string;
  dias: number;
  periodo_facturacion: string;
  gasto_id: number;
  inquilino: InquilinoFiscal | null;
  importe: number;
};

export type FiscalHabitacionOcupacion = {
  id: number;
  nombre: string;
  tipo: string;
  es_habitable: boolean;
  precio: number | null;
  dias_alquilados: number;
  meses_equivalentes: number;
  porcentaje_ocupacion: number;
  estado: FiscalEstadoOcupacion;
  requiere_revision: boolean;
  revisiones: FiscalRevision[];
  periodos: FiscalPeriodoOcupacion[];
};

export type FiscalGastoProrrateado = {
  id: number;
  concepto: string;
  importe: number;
  tipo: string;
  fecha: string;
  prorrateo: {
    modo: 'MANUAL' | 'OCUPACION';
    porcentaje: number;
    importe_prorrateado: number;
  };
};

export type FiscalFotoOcupacionVivienda = {
  ejercicio: number;
  periodo: {
    inicio: string;
    fin: string;
    dias: number;
  };
  vivienda: {
    id: number;
    alias_nombre: string;
    direccion: string;
    codigo_postal: string;
    ciudad: string;
    provincia: string;
  };
  resumen: {
    dias_alquilados: number;
    meses_equivalentes: number;
    porcentaje_ocupacion: number;
    estado: FiscalEstadoOcupacion;
    habitaciones_con_actividad: number;
    habitaciones_requieren_revision: number;
    requiere_revision: boolean;
  };
  habitaciones: FiscalHabitacionOcupacion[];
  gastos_prorrateados: FiscalGastoProrrateado[];
};

type ConstruirFotoInput = {
  ejercicio: number;
  vivienda: {
    id: number;
    alias_nombre: string;
    direccion: string;
    codigo_postal: string;
    ciudad: string;
    provincia: string;
    habitaciones: HabitacionFiscal[];
  };
  gastos: GastoFiscal[];
};

const MS_DIA = 24 * 60 * 60 * 1000;

const isoFecha = (fecha: Date) => fecha.toISOString().slice(0, 10);

const diasEntre = (inicio: Date, fin: Date) => Math.round((fin.getTime() - inicio.getTime()) / MS_DIA);

const redondear = (valor: number, decimales = 2) => {
  const factor = 10 ** decimales;
  return Math.round((valor + Number.EPSILON) * factor) / factor;
};

const parsePeriodoMensual = (periodo: string) => {
  const match = /^(\d{4})-(\d{2})$/.exec(periodo);
  if (!match) return null;

  const ano = Number(match[1]);
  const mes = Number(match[2]);
  if (!Number.isInteger(ano) || !Number.isInteger(mes) || mes < 1 || mes > 12) return null;

  return {
    inicio: new Date(Date.UTC(ano, mes - 1, 1)),
    fin: new Date(Date.UTC(ano, mes, 1)),
  };
};

const recortarPeriodo = (inicio: Date, fin: Date, inicioEjercicio: Date, finEjercicio: Date) => {
  const inicioRecortado = new Date(Math.max(inicio.getTime(), inicioEjercicio.getTime()));
  const finRecortado = new Date(Math.min(fin.getTime(), finEjercicio.getTime()));

  if (finRecortado <= inicioRecortado) return null;
  return { inicio: inicioRecortado, fin: finRecortado };
};

const calcularEstado = (diasAlquilados: number, diasEjercicio: number): FiscalEstadoOcupacion => {
  if (diasAlquilados <= 0) return 'SIN_ACTIVIDAD';
  return diasAlquilados >= diasEjercicio ? 'TODO_EL_ANO' : 'PARCIAL';
};

const calcularProrrateo = (importe: number, porcentaje: number) =>
  desdeCentimos(Math.round(aCentimos(importe) * (porcentaje / 100)));

const obtenerPorcentajeProrrateo = (manual: number | null, porcentajeOcupacion: number) => {
  if (manual !== null && Number.isFinite(manual) && manual >= 0 && manual <= 100) {
    return { modo: 'MANUAL' as const, porcentaje: redondear(manual, 4) };
  }

  return { modo: 'OCUPACION' as const, porcentaje: porcentajeOcupacion };
};

export const construirFotoOcupacionFiscal = ({
  ejercicio,
  vivienda,
  gastos,
}: ConstruirFotoInput): FiscalFotoOcupacionVivienda => {
  const inicioEjercicio = new Date(Date.UTC(ejercicio, 0, 1));
  const finEjercicio = new Date(Date.UTC(ejercicio + 1, 0, 1));
  const diasEjercicio = diasEntre(inicioEjercicio, finEjercicio);
  const cargosAlquiler = gastos.filter((gasto) => gasto.tipo === 'ALQUILER_HABITACION');
  const revisionesVivienda: FiscalRevision[] = [];

  const habitaciones = vivienda.habitaciones.map((habitacion) => {
    const revisiones: FiscalRevision[] = [];
    const cargosHabitacion = cargosAlquiler.filter((gasto) => gasto.habitacion_cargo_id === habitacion.id);
    const periodos: FiscalPeriodoOcupacion[] = [];

    for (const cargo of cargosHabitacion) {
      if (!cargo.periodo_facturacion) {
        const revision = {
          codigo: 'SIN_PERIODO_FACTURACION' as const,
          mensaje: `El cargo ${cargo.id} no tiene periodo_facturacion para calcular ocupacion anual.`,
        };
        revisiones.push(revision);
        revisionesVivienda.push(revision);
        continue;
      }

      const periodo = parsePeriodoMensual(cargo.periodo_facturacion);
      if (!periodo) {
        const revision = {
          codigo: 'SIN_PERIODO_FACTURACION' as const,
          mensaje: `El cargo ${cargo.id} tiene un periodo_facturacion no mensual: ${cargo.periodo_facturacion}.`,
        };
        revisiones.push(revision);
        revisionesVivienda.push(revision);
        continue;
      }

      const recortado = recortarPeriodo(periodo.inicio, periodo.fin, inicioEjercicio, finEjercicio);
      if (!recortado) continue;

      periodos.push({
        inicio: isoFecha(recortado.inicio),
        fin: isoFecha(recortado.fin),
        dias: diasEntre(recortado.inicio, recortado.fin),
        periodo_facturacion: cargo.periodo_facturacion,
        gasto_id: cargo.id,
        inquilino: cargo.inquilino_cargo ?? null,
        importe: normalizarImporteMonetario(cargo.importe),
      });
    }

    if (periodos.length === 0 && habitacion.inquilino_id !== null && habitacion.es_habitable) {
      revisiones.push({
        codigo: 'OCUPACION_ACTUAL_SIN_CARGOS',
        mensaje: 'La habitacion tiene inquilino actual, pero no hay cargos de alquiler del ejercicio.',
      });
    }

    if (periodos.length > 0 && (habitacion.precio === null || habitacion.precio <= 0)) {
      revisiones.push({
        codigo: 'SIN_PRECIO_HABITACION',
        mensaje: 'La habitacion tiene actividad anual, pero no conserva precio mensual valido.',
      });
    }

    const diasAlquilados = periodos.reduce((total, periodo) => total + periodo.dias, 0);
    const porcentajeOcupacion = redondear((Math.min(diasAlquilados, diasEjercicio) / diasEjercicio) * 100, 4);

    return {
      id: habitacion.id,
      nombre: habitacion.nombre,
      tipo: habitacion.tipo,
      es_habitable: habitacion.es_habitable,
      precio: habitacion.precio,
      dias_alquilados: diasAlquilados,
      meses_equivalentes: redondear(diasAlquilados / (diasEjercicio / 12), 2),
      porcentaje_ocupacion: porcentajeOcupacion,
      estado: calcularEstado(diasAlquilados, diasEjercicio),
      requiere_revision: revisiones.length > 0,
      revisiones,
      periodos: periodos.sort((a, b) => a.inicio.localeCompare(b.inicio)),
    };
  });

  const diasAlquiladosVivienda = Math.max(0, ...habitaciones.map((habitacion) => habitacion.dias_alquilados));
  const porcentajeOcupacionVivienda = redondear((Math.min(diasAlquiladosVivienda, diasEjercicio) / diasEjercicio) * 100, 4);
  const gastosProrrateados = gastos
    .filter((gasto) => gasto.tipo !== 'ALQUILER_HABITACION')
    .map((gasto) => {
      const prorrateo = obtenerPorcentajeProrrateo(gasto.prorrateo_fiscal, porcentajeOcupacionVivienda);

      return {
        id: gasto.id,
        concepto: gasto.concepto,
        importe: normalizarImporteMonetario(gasto.importe),
        tipo: gasto.tipo,
        fecha: isoFecha(gasto.fecha_creacion),
        prorrateo: {
          modo: prorrateo.modo,
          porcentaje: prorrateo.porcentaje,
          importe_prorrateado: calcularProrrateo(gasto.importe, prorrateo.porcentaje),
        },
      };
    });

  return {
    ejercicio,
    periodo: {
      inicio: isoFecha(inicioEjercicio),
      fin: isoFecha(finEjercicio),
      dias: diasEjercicio,
    },
    vivienda: {
      id: vivienda.id,
      alias_nombre: vivienda.alias_nombre,
      direccion: vivienda.direccion,
      codigo_postal: vivienda.codigo_postal,
      ciudad: vivienda.ciudad,
      provincia: vivienda.provincia,
    },
    resumen: {
      dias_alquilados: diasAlquiladosVivienda,
      meses_equivalentes: redondear(diasAlquiladosVivienda / (diasEjercicio / 12), 2),
      porcentaje_ocupacion: porcentajeOcupacionVivienda,
      estado: calcularEstado(diasAlquiladosVivienda, diasEjercicio),
      habitaciones_con_actividad: habitaciones.filter((habitacion) => habitacion.dias_alquilados > 0).length,
      habitaciones_requieren_revision: habitaciones.filter((habitacion) => habitacion.requiere_revision).length,
      requiere_revision:
        revisionesVivienda.length > 0 || habitaciones.some((habitacion) => habitacion.requiere_revision),
    },
    habitaciones,
    gastos_prorrateados: gastosProrrateados,
  };
};

export const obtenerFotoOcupacionFiscalVivienda = async (
  viviendaId: number,
  caseroId: number,
  ejercicio: number,
) => {
  const vivienda = await prisma.vivienda.findFirst({
    where: { id: viviendaId, casero_id: caseroId },
    select: {
      id: true,
      alias_nombre: true,
      direccion: true,
      codigo_postal: true,
      ciudad: true,
      provincia: true,
      habitaciones: {
        orderBy: { id: 'asc' },
        select: {
          id: true,
          nombre: true,
          tipo: true,
          es_habitable: true,
          precio: true,
          inquilino_id: true,
          inquilino: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
              documento_identidad: true,
            },
          },
        },
      },
    },
  });

  if (!vivienda) return null;

  const inicioEjercicio = new Date(Date.UTC(ejercicio, 0, 1));
  const finEjercicio = new Date(Date.UTC(ejercicio + 1, 0, 1));
  const gastos = await prisma.gasto.findMany({
    where: {
      vivienda_id: viviendaId,
      OR: [
        {
          tipo: 'ALQUILER_HABITACION',
          periodo_facturacion: {
            gte: `${ejercicio}-01`,
            lte: `${ejercicio}-12`,
          },
        },
        {
          tipo: { not: 'ENTRE_COMPANEROS' },
          fecha_creacion: {
            gte: inicioEjercicio,
            lt: finEjercicio,
          },
        },
      ],
    },
    orderBy: [{ fecha_creacion: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      concepto: true,
      importe: true,
      tipo: true,
      fecha_creacion: true,
      periodo_facturacion: true,
      habitacion_cargo_id: true,
      inquilino_cargo_id: true,
      prorrateo_fiscal: true,
      inquilino_cargo: {
        select: {
          id: true,
          nombre: true,
          apellidos: true,
          documento_identidad: true,
        },
      },
    },
  });

  return construirFotoOcupacionFiscal({ ejercicio, vivienda, gastos });
};
