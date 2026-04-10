import { prisma } from '../lib/prisma';

type CrearGastoDivididoInput = {
  concepto: string;
  importe: number;
  viviendaId: number;
  pagadorId: number;
  implicadosIds?: number[];
  facturaUrl?: string | null;
  fecha?: Date;
  repartoManual?: {
    usuario_id: number;
    importe: number;
  }[];
};

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

export const crearGastoDividido = async ({
  concepto,
  importe,
  viviendaId,
  pagadorId,
  implicadosIds,
  facturaUrl,
  fecha,
  repartoManual,
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

    const hayImportesInvalidos = repartoManual.some((linea) => linea.importe <= 0);
    if (hayImportesInvalidos) {
      throw new Error('Todos los importes de repartoManual deben ser mayores que 0.');
    }

    const totalCentimos = Math.round(importe * 100);
    const sumaCentimos = repartoManual.reduce(
      (total, linea) => total + Math.round(linea.importe * 100),
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
        importe,
        factura_url: facturaUrl ?? null,
        fecha_creacion: fecha,
        pagador_id: pagadorId,
        vivienda_id: viviendaId,
        deudas: {
          create: repartoManual
            .filter((linea) => linea.usuario_id !== pagadorId)
            .map((linea) => ({
              deudor_id: linea.usuario_id,
              acreedor_id: pagadorId,
              importe: parseFloat(linea.importe.toFixed(2)),
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
  const importePorPersona = parseFloat((importe / participantesIds.length).toFixed(2));

  return prisma.gasto.create({
    data: {
      concepto,
      importe,
      factura_url: facturaUrl ?? null,
      fecha_creacion: fecha,
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
  });
};
