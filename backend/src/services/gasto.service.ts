import { prisma } from '../lib/prisma';

export const TIPOS_GASTO_CASERO = [
  'FACTURA_PUNTUAL',
  'FACTURA_MENSUAL',
  'CARGO_RECURRENTE',
  'ALQUILER_HABITACION',
] as const;

export const TIPOS_GASTO_COMPANEROS = ['ENTRE_COMPANEROS'] as const;

export type TipoGastoRoomies =
  | (typeof TIPOS_GASTO_CASERO)[number]
  | (typeof TIPOS_GASTO_COMPANEROS)[number];

type CrearGastoDivididoInput = {
  concepto: string;
  importe: number;
  tipo?: TipoGastoRoomies;
  viviendaId: number;
  pagadorId: number;
  implicadosIds?: number[];
  facturaUrl?: string | null;
  fecha?: Date;
  repartoManual?: {
    usuario_id: number;
    importe: number;
  }[];
  periodoFacturacion?: string | null;
  habitacionCargoId?: number | null;
  inquilinoCargoId?: number | null;
};

type CrearCargosMensualesHabitacionResultado = {
  periodo: string;
  creados: number;
  omitidosExistentes: number;
  omitidosSinPrecio: number;
  omitidosSinInquilino: number;
};

const esErrorDuplicadoPrisma = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code?: string }).code === 'P2002';

export const usuarioPerteneceAVivienda = async (viviendaId: number, usuarioId: number) => {
  return prisma.habitacion.findFirst({
    where: { vivienda_id: viviendaId, inquilino_id: usuarioId },
    select: { id: true },
  });
};

export const usuarioEsCaseroDeVivienda = async (viviendaId: number, usuarioId: number) => {
  return prisma.vivienda.findFirst({
    where: { id: viviendaId, casero_id: usuarioId },
    select: { id: true, casero_id: true },
  });
};

export const obtenerInquilinosActivosIds = async (viviendaId: number) => {
  const habitaciones = await prisma.habitacion.findMany({
    where: {
      vivienda_id: viviendaId,
      inquilino_id: { not: null },
      es_habitable: true,
      inquilino: { estado_presencia: 'ACTIVO' },
    },
    select: {
      inquilino_id: true,
    },
  });

  return habitaciones.map((habitacion) => habitacion.inquilino_id!);
};

export const aCentimos = (importe: number) => Math.round((importe + Number.EPSILON) * 100);

export const desdeCentimos = (centimos: number) => centimos / 100;

export const normalizarImporteMonetario = (importe: number) => desdeCentimos(aCentimos(importe));

export const repartirImporteEnCentimos = (importe: number, participantesIds: number[]) => {
  const totalCentimos = aCentimos(importe);
  const base = Math.floor(totalCentimos / participantesIds.length);
  const resto = totalCentimos % participantesIds.length;

  return participantesIds.map((usuarioId, index) => ({
    usuario_id: usuarioId,
    importe: desdeCentimos(base + (index < resto ? 1 : 0)),
  }));
};

export const crearGastoDividido = async ({
  concepto,
  importe,
  tipo = 'ENTRE_COMPANEROS',
  viviendaId,
  pagadorId,
  implicadosIds,
  facturaUrl,
  fecha,
  repartoManual,
  periodoFacturacion,
  habitacionCargoId,
  inquilinoCargoId,
}: CrearGastoDivididoInput) => {
  const vivienda = await prisma.vivienda.findUnique({
    where: { id: viviendaId },
    select: { casero_id: true },
  });

  if (!vivienda) {
    throw new Error('La vivienda indicada no existe.');
  }

  const inquilinosActivosIds = await obtenerInquilinosActivosIds(viviendaId);
  const inquilinosActivosSet = new Set(inquilinosActivosIds);
  const implicadosNormalizados = Array.isArray(implicadosIds)
    ? [...new Set(implicadosIds)]
    : [];
  const importeNormalizado = normalizarImporteMonetario(importe);

  if (implicadosNormalizados.length > 0) {
    const hayInvalidos = implicadosNormalizados.some((id) => !inquilinosActivosSet.has(id));
    if (hayInvalidos) {
      throw new Error('Todos los implicados deben pertenecer a la vivienda.');
    }
  }

  const pagadorEsInquilinoActivo = inquilinosActivosSet.has(pagadorId);
  const pagadorEsCasero = vivienda.casero_id === pagadorId;

  if (!pagadorEsInquilinoActivo && !pagadorEsCasero) {
    throw new Error('El pagador debe ser el casero o un inquilino activo de la vivienda.');
  }

  if (repartoManual && repartoManual.length > 0) {
    const usuariosReparto = repartoManual.map((linea) => linea.usuario_id);
    const usuariosUnicos = new Set(usuariosReparto);

    if (usuariosUnicos.size !== usuariosReparto.length) {
      throw new Error('repartoManual no puede contener inquilinos duplicados.');
    }

    const hayUsuariosInvalidos = usuariosReparto.some((id) => !inquilinosActivosSet.has(id));
    if (hayUsuariosInvalidos) {
      throw new Error('Todos los usuarios de repartoManual deben ser inquilinos activos de la vivienda.');
    }

    const hayImportesInvalidos = repartoManual.some((linea) => linea.importe < 0);
    if (hayImportesInvalidos) {
      throw new Error('Los importes de repartoManual no pueden ser negativos.');
    }

    const totalCentimos = aCentimos(importeNormalizado);
    const sumaCentimos = repartoManual.reduce(
      (total, linea) => total + aCentimos(linea.importe),
      0,
    );

    if (sumaCentimos !== totalCentimos) {
      const descuadre = (sumaCentimos - totalCentimos) / 100;
      throw new Error(
        `El reparto manual suma ${(sumaCentimos / 100).toFixed(2)} EUR y el gasto total es ${(totalCentimos / 100).toFixed(2)} EUR. Descuadre: ${descuadre.toFixed(2)} EUR.`,
      );
    }

    return prisma.gasto.create({
      data: {
        concepto,
        importe: importeNormalizado,
        tipo,
        factura_url: facturaUrl ?? null,
        fecha_creacion: fecha,
        pagador_id: pagadorId,
        periodo_facturacion: periodoFacturacion ?? null,
        habitacion_cargo_id: habitacionCargoId ?? null,
        inquilino_cargo_id: inquilinoCargoId ?? null,
        vivienda_id: viviendaId,
        deudas: {
          create: repartoManual
            .filter((linea) => linea.usuario_id !== pagadorId && aCentimos(linea.importe) > 0)
            .map((linea) => ({
              deudor_id: linea.usuario_id,
              acreedor_id: pagadorId,
              importe: normalizarImporteMonetario(linea.importe),
            })),
        },
      },
      include: { deudas: true },
    });
  }

  const participantesIds =
    implicadosNormalizados.length > 0 ? implicadosNormalizados : inquilinosActivosIds;

  if (participantesIds.length === 0) {
    throw new Error('No hay inquilinos activos para repartir este gasto.');
  }

  const deudoresIds = participantesIds.filter((id) => id !== pagadorId);
  const repartoAutomatico = repartirImporteEnCentimos(importeNormalizado, participantesIds);
  const importesPorUsuario = new Map(
    repartoAutomatico.map((linea) => [linea.usuario_id, normalizarImporteMonetario(linea.importe)]),
  );

  return prisma.gasto.create({
    data: {
      concepto,
      importe: importeNormalizado,
      tipo,
      factura_url: facturaUrl ?? null,
      fecha_creacion: fecha,
      pagador_id: pagadorId,
      periodo_facturacion: periodoFacturacion ?? null,
      habitacion_cargo_id: habitacionCargoId ?? null,
      inquilino_cargo_id: inquilinoCargoId ?? null,
      vivienda_id: viviendaId,
      deudas: {
        create: deudoresIds
          .map((deudorId) => ({
            deudor_id: deudorId,
            acreedor_id: pagadorId,
            importe: importesPorUsuario.get(deudorId) ?? 0,
          }))
          .filter((deuda) => aCentimos(deuda.importe) > 0),
      },
    },
    include: { deudas: true },
  });
};

export const obtenerPeriodoMensual = (fecha = new Date()) => {
  const mes = `${fecha.getMonth() + 1}`.padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}`;
};

export const crearCargosMensualesHabitacion = async (
  fecha = new Date(),
): Promise<CrearCargosMensualesHabitacionResultado> => {
  const periodo = obtenerPeriodoMensual(fecha);
  const fechaCargo = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  const resultado: CrearCargosMensualesHabitacionResultado = {
    periodo,
    creados: 0,
    omitidosExistentes: 0,
    omitidosSinPrecio: 0,
    omitidosSinInquilino: 0,
  };

  const habitaciones = await prisma.habitacion.findMany({
    where: {
      es_habitable: true,
      inquilino_id: { not: null },
      inquilino: { estado_presencia: 'ACTIVO' },
    },
    select: {
      id: true,
      nombre: true,
      precio: true,
      inquilino_id: true,
      vivienda_id: true,
      vivienda: {
        select: {
          casero_id: true,
          alias_nombre: true,
        },
      },
    },
  });

  for (const habitacion of habitaciones) {
    if (!habitacion.inquilino_id) {
      resultado.omitidosSinInquilino += 1;
      continue;
    }

    if (habitacion.precio == null || !Number.isFinite(habitacion.precio) || habitacion.precio <= 0) {
      resultado.omitidosSinPrecio += 1;
      console.warn(
        `[cron] Habitacion ${habitacion.id} sin precio valido para el periodo ${periodo}; no se genera alquiler.`,
      );
      continue;
    }

    const existente = await prisma.gasto.findFirst({
      where: {
        tipo: 'ALQUILER_HABITACION',
        periodo_facturacion: periodo,
        habitacion_cargo_id: habitacion.id,
        inquilino_cargo_id: habitacion.inquilino_id,
      },
      select: { id: true },
    });

    if (existente) {
      resultado.omitidosExistentes += 1;
      continue;
    }

    try {
      await crearGastoDividido({
        concepto: `Alquiler ${periodo} - ${habitacion.nombre}`,
        importe: habitacion.precio,
        tipo: 'ALQUILER_HABITACION',
        viviendaId: habitacion.vivienda_id,
        pagadorId: habitacion.vivienda.casero_id,
        implicadosIds: [habitacion.inquilino_id],
        fecha: fechaCargo,
        periodoFacturacion: periodo,
        habitacionCargoId: habitacion.id,
        inquilinoCargoId: habitacion.inquilino_id,
      });
    } catch (error) {
      if (esErrorDuplicadoPrisma(error)) {
        resultado.omitidosExistentes += 1;
        continue;
      }

      throw error;
    }

    resultado.creados += 1;
  }

  return resultado;
};
