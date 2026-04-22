import { prisma } from '../lib/prisma';
import { EstadoPresencia, EstadoTurno, TipoHabitacion } from '../generated/prisma/client';

function getLunesDeSemana(fecha: Date): Date {
  const lunes = new Date(fecha);
  const offset = (fecha.getDay() + 6) % 7;
  lunes.setDate(fecha.getDate() - offset);
  lunes.setHours(0, 0, 0, 0);
  return lunes;
}

type HabitacionResponsable = {
  id: number;
  nombre: string;
  tipo: TipoHabitacion;
  es_habitable: boolean;
  inquilino_id?: number | null;
  vivienda_id?: number;
  codigo_invitacion?: string | null;
  metros_cuadrados?: number | null;
  precio?: number | null;
  inquilino: {
    id: number;
    balance_limpieza: number;
    estado_presencia: EstadoPresencia;
  } | null;
};

const esHabitacionOcupadaActiva = (habitacion: HabitacionResponsable) =>
  habitacion.inquilino?.estado_presencia === EstadoPresencia.ACTIVO;

const cargaEfectivaHabitacion = (
  habitacion: HabitacionResponsable,
  cargaSemanal: Map<number, number>,
) => (cargaSemanal.get(habitacion.id) ?? 0) + (habitacion.inquilino?.balance_limpieza ?? 0);

export async function generarTurnosSemanales(viviendaId: number): Promise<void> {
  const ultimoTurno = await prisma.turnoLimpieza.findFirst({
    where: { zona: { vivienda_id: viviendaId } },
    orderBy: { fecha_inicio: 'desc' },
    select: { fecha_inicio: true },
  });

  const hoy = new Date();
  const lunesHoy = getLunesDeSemana(hoy);

  let inicio: Date;
  if (!ultimoTurno || ultimoTurno.fecha_inicio < lunesHoy) {
    inicio = lunesHoy;
  } else {
    const lunesUltimo = getLunesDeSemana(new Date(ultimoTurno.fecha_inicio));
    inicio = new Date(lunesUltimo);
    inicio.setDate(lunesUltimo.getDate() + 7);
  }
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 6);
  fin.setHours(23, 59, 59, 999);

  const habitacionesResponsables = await prisma.habitacion.findMany({
    where: {
      vivienda_id: viviendaId,
      es_habitable: true,
      tipo: TipoHabitacion.DORMITORIO,
    },
    include: {
      inquilino: {
        select: {
          id: true,
          balance_limpieza: true,
          estado_presencia: true,
        },
      },
    },
    orderBy: { id: 'asc' },
  });

  if (habitacionesResponsables.length === 0) {
    throw new Error('No hay habitaciones habitables en la vivienda.');
  }

  const habitacionesActivas = habitacionesResponsables.filter(esHabitacionOcupadaActiva);
  if (habitacionesActivas.length === 0) {
    throw new Error('No hay habitaciones ocupadas activas para repartir la limpieza.');
  }

  const zonas = await prisma.zonaLimpieza.findMany({
    where: { vivienda_id: viviendaId, activa: true },
    include: {
      asignaciones_fijas: {
        include: {
          habitacion: {
            include: {
              inquilino: {
                select: {
                  id: true,
                  balance_limpieza: true,
                  estado_presencia: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { peso: 'desc' },
  });

  if (zonas.length === 0) {
    throw new Error('No hay zonas activas en la vivienda.');
  }

  const habitacionesActivasIds = new Set(habitacionesActivas.map((habitacion) => habitacion.id));
  const cargaSemanal = new Map<number, number>(habitacionesResponsables.map((habitacion) => [habitacion.id, 0]));

  type TurnoData = {
    usuario_id: number | null;
    habitacion_id: number;
    zona_id: number;
    fecha_inicio: Date;
    fecha_fin: Date;
    estado: EstadoTurno;
  };

  const turnos: TurnoData[] = [];
  const zonasRotativas: typeof zonas = [];

  for (const zona of zonas) {
    const asignadasActivas = zona.asignaciones_fijas
      .map((asignacion) => asignacion.habitacion)
      .filter((habitacion): habitacion is typeof habitacion & HabitacionResponsable => Boolean(habitacion))
      .filter((habitacion) => habitacionesActivasIds.has(habitacion.id));

    if (asignadasActivas.length > 0) {
      let elegida = asignadasActivas[0];
      let menorCarga = cargaEfectivaHabitacion(elegida, cargaSemanal);

      for (const habitacion of asignadasActivas) {
        const carga = cargaEfectivaHabitacion(habitacion, cargaSemanal);
        if (carga < menorCarga) {
          menorCarga = carga;
          elegida = habitacion;
        }
      }

      turnos.push({
        usuario_id: elegida.inquilino?.id ?? null,
        habitacion_id: elegida.id,
        zona_id: zona.id,
        fecha_inicio: inicio,
        fecha_fin: fin,
        estado: EstadoTurno.PENDIENTE,
      });
      cargaSemanal.set(elegida.id, (cargaSemanal.get(elegida.id) ?? 0) + zona.peso);
      continue;
    }

    zonasRotativas.push(zona);
  }

  for (const zona of zonasRotativas) {
    let elegida = habitacionesActivas[0];
    let menorCarga = cargaEfectivaHabitacion(elegida, cargaSemanal);

    for (const habitacion of habitacionesActivas) {
      const carga = cargaEfectivaHabitacion(habitacion, cargaSemanal);
      if (carga < menorCarga) {
        menorCarga = carga;
        elegida = habitacion;
      }
    }

    turnos.push({
      usuario_id: elegida.inquilino?.id ?? null,
      habitacion_id: elegida.id,
      zona_id: zona.id,
      fecha_inicio: inicio,
      fecha_fin: fin,
      estado: EstadoTurno.PENDIENTE,
    });
    cargaSemanal.set(elegida.id, (cargaSemanal.get(elegida.id) ?? 0) + zona.peso);
  }

  const habitacionesConBalance = habitacionesActivas.filter((habitacion) => habitacion.inquilino !== null);

  const pesoTotal = zonas.reduce((acc, zona) => acc + zona.peso, 0);
  const cuotaIdeal = pesoTotal / habitacionesConBalance.length;

  const actualizacionesBalance = habitacionesConBalance.map((habitacion) => {
    const cargaAsignada = cargaSemanal.get(habitacion.id) ?? 0;
    const inquilino = habitacion.inquilino!;
    const nuevoBalance = inquilino.balance_limpieza + (cargaAsignada - cuotaIdeal);
    return prisma.usuario.update({
      where: { id: inquilino.id },
      data: { balance_limpieza: nuevoBalance },
    });
  });

  await prisma.$transaction([
    prisma.turnoLimpieza.createMany({ data: turnos }),
    ...actualizacionesBalance,
  ]);
}
