import { prisma } from '../lib/prisma';
import {
  aCentimos,
  CategoriaFiscalGastoRoomies,
  desdeCentimos,
  normalizarImporteMonetario,
  TIPOS_GASTO_CASERO,
  TipoGastoRoomies,
} from './gasto.service';

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
  factura_url?: string | null;
  categoria_fiscal?: CategoriaFiscalGastoRoomies;
  deducible_previsto?: boolean | null;
  notas_fiscales?: string | null;
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

type CaseroFiscal = {
  id: number;
  nombre: string;
  apellidos: string | null;
  documento_identidad?: string | null;
};

type ViviendaResumenFiscal = {
  id: number;
  alias_nombre: string;
  direccion: string;
  codigo_postal: string;
  ciudad: string;
  provincia: string;
  casero: CaseroFiscal;
  habitaciones?: Array<{
    id: number;
    nombre: string;
  }>;
};

type DeudaResumenFiscal = {
  id: number;
  importe: number;
  estado: string;
  justificante_url: string | null;
  deudor: InquilinoFiscal;
  gasto: GastoFiscal & {
    habitacion_cargo?: { id: number; nombre: string } | null;
    inquilino_cargo?: InquilinoFiscal | null;
  };
};

export type FiscalAdvertenciaResumen = {
  codigo:
    | 'FALTA_FACTURA'
    | 'FALTA_CATEGORIA'
    | 'IMPORTE_PENDIENTE'
    | 'PERIODO_INCOMPLETO'
    | 'PRORRATEO_MANUAL';
  mensaje: string;
  gasto_id?: number;
  deuda_id?: number;
};

type FiscalEstadoPagoResumen = 'COBRADO' | 'PENDIENTE' | 'ANULADO';
type FiscalDeducibilidadResumen = 'NO_APLICA' | 'PENDIENTE_CLASIFICACION' | 'DEDUCIBLE' | 'NO_DEDUCIBLE';

export type FiscalLineaResumen = {
  id: string;
  naturaleza: 'INGRESO' | 'GASTO_POTENCIALMENTE_DEDUCIBLE';
  fuente: {
    modelo: 'Deuda' | 'Gasto';
    gasto_id: number;
    deuda_id?: number;
  };
  concepto: string;
  categoria: TipoGastoRoomies | CategoriaFiscalGastoRoomies | 'PENDIENTE_CLASIFICACION';
  deducibilidad: FiscalDeducibilidadResumen;
  importe: number;
  moneda: 'EUR';
  fecha: string;
  periodo_facturacion: string | null;
  estado_pago: FiscalEstadoPagoResumen;
  factura_url: string | null;
  justificante_url?: string | null;
  metadata_fiscal?: {
    categoria_fiscal: CategoriaFiscalGastoRoomies;
    deducible_previsto: boolean | null;
    notas_fiscales: string | null;
    prorrateo_fiscal: number | null;
  };
  habitacion?: {
    id: number;
    nombre: string;
  } | null;
  inquilino?: InquilinoFiscal | null;
  advertencias: FiscalAdvertenciaResumen[];
};

export type FiscalResumenAnualVivienda = {
  ejercicio: number;
  generado_en: string;
  vivienda: {
    id: number;
    alias_nombre: string;
    direccion: string;
    codigo_postal: string;
    ciudad: string;
    provincia: string;
  };
  casero: CaseroFiscal;
  totales: {
    ingresos: {
      emitido: number;
      cobrado: number;
      pendiente: number;
      anulado: number;
      por_tipo: Record<string, number>;
    };
    gastos: {
      potencialmente_deducible: number;
      deducible_previsto: number;
      no_deducible_previsto: number;
      pendiente_clasificacion: number;
      con_factura: number;
      sin_factura: number;
      por_categoria: Record<string, number>;
    };
  };
  lineas: FiscalLineaResumen[];
  advertencias: FiscalAdvertenciaResumen[];
};

export type FiscalDossierFiscal = {
  nombreArchivo: string;
  mimeType: 'text/csv';
  contenido: string;
  columnas: {
    resumen: string[];
    detalle: string[];
  };
};

const MS_DIA = 24 * 60 * 60 * 1000;
const MIME_CSV = 'text/csv' as const;
const COLUMNAS_DOSSIER_RESUMEN = ['Clave', 'Valor', 'Moneda', 'Notas'] as const;
const COLUMNAS_DOSSIER_DETALLE = [
  'Linea ID',
  'Naturaleza',
  'Modelo origen',
  'Gasto ID',
  'Deuda ID',
  'Concepto',
  'Categoria',
  'Deducibilidad',
  'Importe',
  'Moneda',
  'Fecha',
  'Periodo facturacion',
  'Estado pago',
  'Factura URL',
  'Justificante URL',
  'Habitacion ID',
  'Habitacion',
  'Inquilino ID',
  'Inquilino',
  'Documento inquilino',
  'Advertencias',
] as const;

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

const sumarCentimos = (importes: number[]) =>
  desdeCentimos(importes.reduce((total, importe) => total + aCentimos(importe), 0));

const sumarEnMapa = (mapa: Record<string, number>, clave: string, importe: number) => {
  mapa[clave] = sumarCentimos([mapa[clave] ?? 0, importe]);
};

const escaparCsv = (valor: unknown) => {
  const texto = String(valor ?? '');
  const seguro = /^[=+\-@]/.test(texto) ? `'${texto}` : texto;
  return `"${seguro.replace(/"/g, '""')}"`;
};

const limpiarNombreArchivo = (valor: string) =>
  valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

const nombreCompleto = (usuario: { nombre: string; apellidos: string | null } | null | undefined) =>
  usuario ? `${usuario.nombre}${usuario.apellidos ? ` ${usuario.apellidos}` : ''}` : '';

const serializarAdvertencias = (advertencias: FiscalAdvertenciaResumen[]) =>
  advertencias.map((advertencia) => `${advertencia.codigo}: ${advertencia.mensaje}`).join(' | ');

const filaCsv = (valores: readonly unknown[]) => valores.map(escaparCsv).join(';');

const crearFilasMapa = (prefijo: string, valores: Record<string, number>) =>
  Object.entries(valores)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([clave, valor]) => [`${prefijo}.${clave}`, valor, 'EUR', '']);

const generarCsvDossierFiscal = (resumen: FiscalResumenAnualVivienda) => {
  const filasResumen = [
    ['ejercicio', resumen.ejercicio, '', 'Ano natural exportado'],
    ['generado_en', resumen.generado_en, '', 'Fecha ISO de generacion'],
    ['solicitante', nombreCompleto(resumen.casero), '', `usuario_id=${resumen.casero.id}`],
    ['vivienda', resumen.vivienda.alias_nombre, '', `vivienda_id=${resumen.vivienda.id}`],
    ['direccion', resumen.vivienda.direccion, '', `${resumen.vivienda.codigo_postal} ${resumen.vivienda.ciudad}`],
    ['ingresos.emitido', resumen.totales.ingresos.emitido, 'EUR', 'Total facturado a inquilinos'],
    ['ingresos.cobrado', resumen.totales.ingresos.cobrado, 'EUR', 'Total marcado como pagado'],
    ['ingresos.pendiente', resumen.totales.ingresos.pendiente, 'EUR', 'Total pendiente de cobro'],
    ['ingresos.anulado', resumen.totales.ingresos.anulado, 'EUR', 'Total anulado'],
    ...crearFilasMapa('ingresos.por_tipo', resumen.totales.ingresos.por_tipo),
    [
      'gastos.potencialmente_deducible',
      resumen.totales.gastos.potencialmente_deducible,
      'EUR',
      'Gastos del flujo propietario',
    ],
    ['gastos.deducible_previsto', resumen.totales.gastos.deducible_previsto, 'EUR', 'Marcados como deducibles'],
    ['gastos.no_deducible_previsto', resumen.totales.gastos.no_deducible_previsto, 'EUR', 'Marcados como no deducibles'],
    [
      'gastos.pendiente_clasificacion',
      resumen.totales.gastos.pendiente_clasificacion,
      'EUR',
      'Sin categoria fiscal o deducibilidad clara',
    ],
    ['gastos.con_factura', resumen.totales.gastos.con_factura, 'EUR', 'Con factura_url'],
    ['gastos.sin_factura', resumen.totales.gastos.sin_factura, 'EUR', 'Sin factura_url'],
    ...crearFilasMapa('gastos.por_categoria', resumen.totales.gastos.por_categoria),
    ['revision.lineas_problematicas', resumen.lineas.filter((linea) => linea.advertencias.length > 0).length, '', ''],
    ['revision.advertencias', resumen.advertencias.length, '', serializarAdvertencias(resumen.advertencias)],
  ];

  const filasDetalle = resumen.lineas.map((linea) => [
    linea.id,
    linea.naturaleza,
    linea.fuente.modelo,
    linea.fuente.gasto_id,
    linea.fuente.deuda_id ?? '',
    linea.concepto,
    linea.categoria,
    linea.deducibilidad,
    linea.importe,
    linea.moneda,
    linea.fecha,
    linea.periodo_facturacion ?? '',
    linea.estado_pago,
    linea.factura_url ?? '',
    linea.justificante_url ?? '',
    linea.habitacion?.id ?? '',
    linea.habitacion?.nombre ?? '',
    linea.inquilino?.id ?? '',
    nombreCompleto(linea.inquilino),
    linea.inquilino?.documento_identidad ?? '',
    serializarAdvertencias(linea.advertencias),
  ]);

  const lineas = [
    '# RESUMEN',
    filaCsv(COLUMNAS_DOSSIER_RESUMEN),
    ...filasResumen.map(filaCsv),
    '',
    '# DETALLE',
    filaCsv(COLUMNAS_DOSSIER_DETALLE),
    ...filasDetalle.map(filaCsv),
  ];

  return `\uFEFF${lineas.join('\r\n')}`;
};

export const generarBufferCsvExcel = (csv: string) =>
  Buffer.concat([
    Buffer.from([0xff, 0xfe]),
    Buffer.from(csv.replace(/^\uFEFF/, ''), 'utf16le'),
  ]);

export const construirDossierFiscal = (resumen: FiscalResumenAnualVivienda): FiscalDossierFiscal => {
  const viviendaSlug = limpiarNombreArchivo(resumen.vivienda.alias_nombre || `vivienda-${resumen.vivienda.id}`);
  const fechaGeneracion = isoFecha(new Date(resumen.generado_en));

  return {
    nombreArchivo: `dossier-fiscal-${viviendaSlug}-${resumen.ejercicio}-${fechaGeneracion}.csv`,
    mimeType: MIME_CSV,
    contenido: generarCsvDossierFiscal(resumen),
    columnas: {
      resumen: [...COLUMNAS_DOSSIER_RESUMEN],
      detalle: [...COLUMNAS_DOSSIER_DETALLE],
    },
  };
};

const esPeriodoMensualDelEjercicio = (periodo: string | null, ejercicio: number) => {
  if (!periodo) return false;
  const periodoMensual = parsePeriodoMensual(periodo);
  return periodoMensual !== null && periodo.startsWith(`${ejercicio}-`);
};

const construirAdvertenciasGasto = (gasto: GastoFiscal, ejercicio: number): FiscalAdvertenciaResumen[] => {
  const advertencias: FiscalAdvertenciaResumen[] = [];

  if (!gasto.factura_url) {
    advertencias.push({
      codigo: 'FALTA_FACTURA',
      mensaje: `El gasto ${gasto.id} no tiene factura asociada.`,
      gasto_id: gasto.id,
    });
  }

  if ((gasto.categoria_fiscal ?? 'SIN_CLASIFICAR') === 'SIN_CLASIFICAR') {
    advertencias.push({
      codigo: 'FALTA_CATEGORIA',
      mensaje: `El gasto ${gasto.id} esta sin categoria fiscal.`,
      gasto_id: gasto.id,
    });
  }

  if (gasto.tipo === 'ALQUILER_HABITACION' && !esPeriodoMensualDelEjercicio(gasto.periodo_facturacion, ejercicio)) {
    advertencias.push({
      codigo: 'PERIODO_INCOMPLETO',
      mensaje: `El alquiler ${gasto.id} no conserva un periodo mensual valido del ejercicio.`,
      gasto_id: gasto.id,
    });
  }

  if (gasto.prorrateo_fiscal !== null && gasto.prorrateo_fiscal !== undefined) {
    advertencias.push({
      codigo: 'PRORRATEO_MANUAL',
      mensaje: `El gasto ${gasto.id} usa prorrateo fiscal manual.`,
      gasto_id: gasto.id,
    });
  }

  return advertencias;
};

const deducibilidadDesdeGasto = (gasto: GastoFiscal): FiscalDeducibilidadResumen => {
  if ((gasto.categoria_fiscal ?? 'SIN_CLASIFICAR') === 'SIN_CLASIFICAR') return 'PENDIENTE_CLASIFICACION';
  if (gasto.deducible_previsto === true) return 'DEDUCIBLE';
  if (gasto.deducible_previsto === false) return 'NO_DEDUCIBLE';
  return 'PENDIENTE_CLASIFICACION';
};

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

export const construirResumenFiscalAnual = ({
  ejercicio,
  vivienda,
  deudas,
  gastos,
  generadoEn = new Date(),
}: {
  ejercicio: number;
  vivienda: ViviendaResumenFiscal;
  deudas: DeudaResumenFiscal[];
  gastos: GastoFiscal[];
  generadoEn?: Date;
}): FiscalResumenAnualVivienda => {
  const ingresos = {
    emitido: 0,
    cobrado: 0,
    pendiente: 0,
    anulado: 0,
    por_tipo: {} as Record<string, number>,
  };
  const gastosTotales = {
    potencialmente_deducible: 0,
    deducible_previsto: 0,
    no_deducible_previsto: 0,
    pendiente_clasificacion: 0,
    con_factura: 0,
    sin_factura: 0,
    por_categoria: {} as Record<string, number>,
  };

  const lineasIngresos = deudas.map((deuda): FiscalLineaResumen => {
    const importe = normalizarImporteMonetario(deuda.importe);
    ingresos.emitido = sumarCentimos([ingresos.emitido, importe]);
    sumarEnMapa(ingresos.por_tipo, deuda.gasto.tipo, importe);

    if (deuda.estado === 'PAGADA') {
      ingresos.cobrado = sumarCentimos([ingresos.cobrado, importe]);
    } else {
      ingresos.pendiente = sumarCentimos([ingresos.pendiente, importe]);
    }

    const advertencias = construirAdvertenciasGasto(deuda.gasto, ejercicio);
    if (deuda.estado !== 'PAGADA') {
      advertencias.push({
        codigo: 'IMPORTE_PENDIENTE',
        mensaje: `La deuda ${deuda.id} esta pendiente de cobro.`,
        gasto_id: deuda.gasto.id,
        deuda_id: deuda.id,
      });
    }

    return {
      id: `deuda-${deuda.id}`,
      naturaleza: 'INGRESO',
      fuente: {
        modelo: 'Deuda',
        gasto_id: deuda.gasto.id,
        deuda_id: deuda.id,
      },
      concepto: deuda.gasto.concepto,
      categoria: deuda.gasto.tipo as TipoGastoRoomies,
      deducibilidad: 'NO_APLICA',
      importe,
      moneda: 'EUR',
      fecha: isoFecha(deuda.gasto.fecha_creacion),
      periodo_facturacion: deuda.gasto.periodo_facturacion,
      estado_pago: deuda.estado === 'PAGADA' ? 'COBRADO' : 'PENDIENTE',
      factura_url: deuda.gasto.factura_url ?? null,
      justificante_url: deuda.justificante_url,
      habitacion: deuda.gasto.habitacion_cargo ?? null,
      inquilino: deuda.gasto.inquilino_cargo ?? deuda.deudor,
      advertencias,
    };
  });

  const lineasGastos = gastos.map((gasto): FiscalLineaResumen => {
    const importe = normalizarImporteMonetario(gasto.importe);
    const categoria = gasto.categoria_fiscal ?? 'SIN_CLASIFICAR';
    const deducibilidad = deducibilidadDesdeGasto(gasto);

    gastosTotales.potencialmente_deducible = sumarCentimos([gastosTotales.potencialmente_deducible, importe]);
    sumarEnMapa(gastosTotales.por_categoria, categoria, importe);

    if (gasto.factura_url) {
      gastosTotales.con_factura = sumarCentimos([gastosTotales.con_factura, importe]);
    } else {
      gastosTotales.sin_factura = sumarCentimos([gastosTotales.sin_factura, importe]);
    }

    if (deducibilidad === 'DEDUCIBLE') {
      gastosTotales.deducible_previsto = sumarCentimos([gastosTotales.deducible_previsto, importe]);
    } else if (deducibilidad === 'NO_DEDUCIBLE') {
      gastosTotales.no_deducible_previsto = sumarCentimos([gastosTotales.no_deducible_previsto, importe]);
    } else {
      gastosTotales.pendiente_clasificacion = sumarCentimos([gastosTotales.pendiente_clasificacion, importe]);
    }

    return {
      id: `gasto-${gasto.id}`,
      naturaleza: 'GASTO_POTENCIALMENTE_DEDUCIBLE',
      fuente: {
        modelo: 'Gasto',
        gasto_id: gasto.id,
      },
      concepto: gasto.concepto,
      categoria: categoria === 'SIN_CLASIFICAR' ? 'PENDIENTE_CLASIFICACION' : categoria,
      deducibilidad,
      importe,
      moneda: 'EUR',
      fecha: isoFecha(gasto.fecha_creacion),
      periodo_facturacion: gasto.periodo_facturacion,
      estado_pago: 'COBRADO',
      factura_url: gasto.factura_url ?? null,
      metadata_fiscal: {
        categoria_fiscal: categoria,
        deducible_previsto: gasto.deducible_previsto ?? null,
        notas_fiscales: gasto.notas_fiscales ?? null,
        prorrateo_fiscal: gasto.prorrateo_fiscal ?? null,
      },
      habitacion: null,
      inquilino: null,
      advertencias: construirAdvertenciasGasto(gasto, ejercicio),
    };
  });

  const lineas = [...lineasIngresos, ...lineasGastos].sort((a, b) => {
    const porFecha = a.fecha.localeCompare(b.fecha);
    return porFecha !== 0 ? porFecha : a.id.localeCompare(b.id);
  });

  return {
    ejercicio,
    generado_en: generadoEn.toISOString(),
    vivienda: {
      id: vivienda.id,
      alias_nombre: vivienda.alias_nombre,
      direccion: vivienda.direccion,
      codigo_postal: vivienda.codigo_postal,
      ciudad: vivienda.ciudad,
      provincia: vivienda.provincia,
    },
    casero: vivienda.casero,
    totales: {
      ingresos,
      gastos: gastosTotales,
    },
    lineas,
    advertencias: lineas.flatMap((linea) => linea.advertencias),
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

export const obtenerResumenFiscalAnualVivienda = async (
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
      casero: {
        select: {
          id: true,
          nombre: true,
          apellidos: true,
          documento_identidad: true,
        },
      },
    },
  });

  if (!vivienda) return null;

  const inicioEjercicio = new Date(Date.UTC(ejercicio, 0, 1));
  const finEjercicio = new Date(Date.UTC(ejercicio + 1, 0, 1));
  const filtroGastoEjercicio = {
    tipo: { in: [...TIPOS_GASTO_CASERO] },
    OR: [
      {
        fecha_creacion: {
          gte: inicioEjercicio,
          lt: finEjercicio,
        },
      },
      {
        periodo_facturacion: {
          gte: `${ejercicio}-01`,
          lte: `${ejercicio}-12`,
        },
      },
    ],
  };

  const [deudas, gastos] = await Promise.all([
    prisma.deuda.findMany({
      where: {
        acreedor_id: caseroId,
        gasto: {
          vivienda_id: viviendaId,
          ...filtroGastoEjercicio,
        },
      },
      orderBy: [{ gasto: { fecha_creacion: 'asc' } }, { id: 'asc' }],
      include: {
        deudor: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            documento_identidad: true,
          },
        },
        gasto: {
          select: {
            id: true,
            concepto: true,
            importe: true,
            tipo: true,
            factura_url: true,
            categoria_fiscal: true,
            deducible_previsto: true,
            notas_fiscales: true,
            prorrateo_fiscal: true,
            fecha_creacion: true,
            periodo_facturacion: true,
            habitacion_cargo_id: true,
            inquilino_cargo_id: true,
            habitacion_cargo: {
              select: {
                id: true,
                nombre: true,
              },
            },
            inquilino_cargo: {
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
    }),
    prisma.gasto.findMany({
      where: {
        vivienda_id: viviendaId,
        ...filtroGastoEjercicio,
      },
      orderBy: [{ fecha_creacion: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        concepto: true,
        importe: true,
        tipo: true,
        factura_url: true,
        categoria_fiscal: true,
        deducible_previsto: true,
        notas_fiscales: true,
        prorrateo_fiscal: true,
        fecha_creacion: true,
        periodo_facturacion: true,
        habitacion_cargo_id: true,
        inquilino_cargo_id: true,
      },
    }),
  ]);

  return construirResumenFiscalAnual({
    ejercicio,
    vivienda,
    deudas,
    gastos,
  });
};

export const obtenerDossierFiscalVivienda = async (
  viviendaId: number,
  caseroId: number,
  ejercicio: number,
) => {
  const resumen = await obtenerResumenFiscalAnualVivienda(viviendaId, caseroId, ejercicio);
  if (!resumen) return null;
  return construirDossierFiscal(resumen);
};
