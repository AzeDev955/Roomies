import { prisma } from '../lib/prisma';

type CrearGastoDivididoInput = {
  concepto: string;
  importe: number;
  viviendaId: number;
  pagadorId: number;
  implicadosIds?: number[];
};

export const usuarioPerteneceAVivienda = async (viviendaId: number, usuarioId: number) => {
  return prisma.habitacion.findFirst({
    where: { vivienda_id: viviendaId, inquilino_id: usuarioId },
    select: { id: true },
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
}: CrearGastoDivididoInput) => {
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

  if (!inquilinosActivosSet.has(pagadorId)) {
    throw new Error('El pagador debe pertenecer a la vivienda como inquilino activo.');
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
