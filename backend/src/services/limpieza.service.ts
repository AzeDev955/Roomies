import { prisma } from '../lib/prisma';
import { EstadoPresencia, EstadoTurno } from '../generated/prisma/client';

/** Devuelve el lunes 00:00 de la semana que contiene `fecha`. */
function getLunesDeSemana(fecha: Date): Date {
  const lunes = new Date(fecha);
  const offset = (fecha.getDay() + 6) % 7; // 0=Lun … 6=Dom
  lunes.setDate(fecha.getDate() - offset);
  lunes.setHours(0, 0, 0, 0);
  return lunes;
}

/**
 * Genera los TurnoLimpieza de la próxima semana para una vivienda.
 *
 * Algoritmo de tres fases:
 *   A) Zonas con asignación fija cuyo usuario está ACTIVO → turno directo.
 *   B) Zonas rotativas → turno al usuario con menor (carga_semanal + balance_limpieza).
 *   C) Actualiza balance_limpieza = balance_anterior + (carga_asignada − cuota_ideal).
 *
 * Todo se persiste en una única transacción de Prisma.
 */
export async function generarTurnosSemanales(viviendaId: number): Promise<void> {
  // Determina la semana objetivo de forma incremental:
  // - Si no hay turnos o el último es de una semana pasada → semana actual.
  // - Si el último es de esta semana o futura → semana siguiente al último turno.
  const ultimoTurno = await prisma.turnoLimpieza.findFirst({
    where: { zona: { vivienda_id: viviendaId } },
    orderBy: { fecha_inicio: 'desc' },
    select: { fecha_inicio: true },
  });

  const hoy = new Date();
  const lunesHoy = getLunesDeSemana(hoy);

  let inicio: Date;
  if (!ultimoTurno || ultimoTurno.fecha_inicio < lunesHoy) {
    // Sin historial o historial antiguo → empezar por la semana actual.
    inicio = lunesHoy;
  } else {
    // Hay turnos recientes → siguiente semana después del último.
    const lunesUltimo = getLunesDeSemana(new Date(ultimoTurno.fecha_inicio));
    inicio = new Date(lunesUltimo);
    inicio.setDate(lunesUltimo.getDate() + 7);
  }
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 6);
  fin.setHours(23, 59, 59, 999);

  // ── 1. Inquilinos ACTIVOS ────────────────────────────────────────────────────
  const habitaciones = await prisma.habitacion.findMany({
    where: {
      vivienda_id: viviendaId,
      inquilino_id: { not: null },
      inquilino: { estado_presencia: EstadoPresencia.ACTIVO },
    },
    include: {
      inquilino: { select: { id: true, balance_limpieza: true } },
    },
  });

  const usuariosActivos = habitaciones
    .filter((h) => h.inquilino !== null)
    .map((h) => h.inquilino!);

  if (usuariosActivos.length === 0) {
    throw new Error('No hay inquilinos activos en la vivienda.');
  }

  // ── 2. Zonas activas con asignaciones fijas (ordenadas desc por peso) ────────
  const zonas = await prisma.zonaLimpieza.findMany({
    where: { vivienda_id: viviendaId, activa: true },
    include: { asignaciones_fijas: true },
    orderBy: { peso: 'desc' },
  });

  if (zonas.length === 0) {
    throw new Error('No hay zonas activas en la vivienda.');
  }

  const activeUserIds = new Set(usuariosActivos.map((u) => u.id));

  // carga_semanal: cuánto peso se ha asignado a cada usuario esta semana.
  const cargaSemanal = new Map<number, number>(usuariosActivos.map((u) => [u.id, 0]));

  type TurnoData = {
    usuario_id: number;
    zona_id: number;
    fecha_inicio: Date;
    fecha_fin: Date;
    estado: EstadoTurno;
  };
  const turnos: TurnoData[] = [];
  const zonasRotativas: typeof zonas = [];

  // ── Fase A: Zonas fijas con sub-rotación ────────────────────────────────────
  // Una zona puede tener varios asignados. De los ACTIVOS, se elige al de menor
  // carga efectiva esta semana → sub-rotación justa entre co-responsables.
  for (const zona of zonas) {
    const asignadosActivos = zona.asignaciones_fijas
      .filter((a) => activeUserIds.has(a.usuario_id))
      .map((a) => usuariosActivos.find((u) => u.id === a.usuario_id)!)
      .filter(Boolean);

    if (asignadosActivos.length > 0) {
      let elegido = asignadosActivos[0];
      let menorCarga = (cargaSemanal.get(elegido.id) ?? 0) + elegido.balance_limpieza;

      for (const usuario of asignadosActivos) {
        const carga = (cargaSemanal.get(usuario.id) ?? 0) + usuario.balance_limpieza;
        if (carga < menorCarga) {
          menorCarga = carga;
          elegido = usuario;
        }
      }

      turnos.push({
        usuario_id: elegido.id,
        zona_id: zona.id,
        fecha_inicio: inicio,
        fecha_fin: fin,
        estado: EstadoTurno.PENDIENTE,
      });
      cargaSemanal.set(elegido.id, (cargaSemanal.get(elegido.id) ?? 0) + zona.peso);
    } else {
      // Sin asignados activos → entra en rotación global.
      zonasRotativas.push(zona);
    }
  }

  // ── Fase B: Zonas rotativas (bloques grandes primero) ───────────────────────
  // El orden desc por peso ya viene de la query; lo mantenemos en zonasRotativas.
  for (const zona of zonasRotativas) {
    // Usuario con menor carga efectiva = carga_semanal + balance_limpieza acumulado.
    let elegido = usuariosActivos[0];
    let menorCarga =
      (cargaSemanal.get(elegido.id) ?? 0) + elegido.balance_limpieza;

    for (const usuario of usuariosActivos) {
      const cargaEfectiva =
        (cargaSemanal.get(usuario.id) ?? 0) + usuario.balance_limpieza;
      if (cargaEfectiva < menorCarga) {
        menorCarga = cargaEfectiva;
        elegido = usuario;
      }
    }

    turnos.push({
      usuario_id: elegido.id,
      zona_id: zona.id,
      fecha_inicio: inicio,
      fecha_fin: fin,
      estado: EstadoTurno.PENDIENTE,
    });
    cargaSemanal.set(elegido.id, (cargaSemanal.get(elegido.id) ?? 0) + zona.peso);
  }

  // ── Fase C: Karma — actualiza balance_limpieza en base de datos ──────────────
  const pesoTotal = zonas.reduce((acc, z) => acc + z.peso, 0);
  const cuotaIdeal = pesoTotal / usuariosActivos.length;

  const actualizacionesBalance = usuariosActivos.map((u) => {
    const cargaAsignada = cargaSemanal.get(u.id) ?? 0;
    const nuevoBalance = u.balance_limpieza + (cargaAsignada - cuotaIdeal);
    return prisma.usuario.update({
      where: { id: u.id },
      data: { balance_limpieza: nuevoBalance },
    });
  });

  // ── Persistencia en transacción atómica ─────────────────────────────────────
  await prisma.$transaction([
    prisma.turnoLimpieza.createMany({ data: turnos }),
    ...actualizacionesBalance,
  ]);
}
