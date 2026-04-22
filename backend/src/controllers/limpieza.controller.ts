import express from 'express';
import { TipoHabitacion } from '../generated/prisma/client';
import { prisma } from '../lib/prisma';
import { generarTurnosSemanales } from '../services/limpieza.service';

type EstadoTurnoExport = 'PENDIENTE' | 'HECHO' | 'NO_HECHO';

const ESTADOS_EXPORTABLES = new Set<EstadoTurnoExport>(['PENDIENTE', 'HECHO', 'NO_HECHO']);
const CABECERAS_EXPORTACION = [
  'Espacio',
  'Tipo de espacio',
  'Habitacion responsable',
  'Responsable actual',
  'Fecha',
];

const normalizarFechaDia = (valor: unknown, finalDia = false) => {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const fecha = new Date(`${valor}T${finalDia ? '23:59:59.999' : '00:00:00.000'}`);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const obtenerSemanaDesdeFecha = (valor: unknown) => {
  const base = normalizarFechaDia(valor);
  if (!base) return null;

  const offset = (base.getDay() + 6) % 7;
  const lunes = new Date(base);
  lunes.setDate(base.getDate() - offset);
  lunes.setHours(0, 0, 0, 0);

  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  domingo.setHours(23, 59, 59, 999);

  return { inicio: lunes, fin: domingo };
};

const formatearFechaCsv = (fecha: Date | string | null | undefined) => {
  if (!fecha) return '';
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  if (Number.isNaN(fechaObj.getTime())) return '';

  return fechaObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const nombreCompleto = (usuario: { nombre: string; apellidos: string | null } | null | undefined) =>
  usuario ? `${usuario.nombre}${usuario.apellidos ? ` ${usuario.apellidos}` : ''}` : 'Sin ocupante';

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

const generarCsvLimpiezas = (
  filas: Array<{
    espacio: string;
    tipoEspacio: string;
    habitacionResponsable: string;
    responsableActual: string;
    fecha: Date;
  }>,
) => {
  const lineas = [
    CABECERAS_EXPORTACION.map(escaparCsv).join(';'),
    ...filas.map((fila) =>
      [
        fila.espacio,
        fila.tipoEspacio,
        fila.habitacionResponsable,
        fila.responsableActual,
        formatearFechaCsv(fila.fecha),
      ]
        .map(escaparCsv)
        .join(';'),
    ),
  ];

  return `\uFEFF${lineas.join('\r\n')}`;
};

const generarBufferCsvExcel = (csv: string) =>
  Buffer.concat([
    Buffer.from([0xff, 0xfe]),
    Buffer.from(csv.replace(/^\uFEFF/, ''), 'utf16le'),
  ]);

const verificarPropiedadVivienda = async (viviendaId: number, caseroId: number) => {
  const vivienda = await prisma.vivienda.findUnique({ where: { id: viviendaId } });
  if (!vivienda || vivienda.casero_id !== caseroId) return null;
  return vivienda;
};

const obtenerContextoAcceso = async (viviendaId: number, usuarioId: number) => {
  const viviendaCasero = await verificarPropiedadVivienda(viviendaId, usuarioId);
  if (viviendaCasero) {
    return { rol: 'CASERO' as const, miHabitacionId: null };
  }

  const miHabitacion = await prisma.habitacion.findFirst({
    where: { vivienda_id: viviendaId, inquilino_id: usuarioId },
    select: { id: true },
  });

  if (!miHabitacion) return null;
  return { rol: 'INQUILINO' as const, miHabitacionId: miHabitacion.id };
};

const obtenerTipoEspacio = (
  habitacion: { tipo: TipoHabitacion; es_habitable: boolean } | null | undefined,
) => {
  if (!habitacion) return 'ESPACIO';
  if (habitacion.tipo === TipoHabitacion.DORMITORIO && habitacion.es_habitable) return 'HABITACION';
  return 'ZONA_COMUN';
};

const etiquetaTipoEspacio = (tipoEspacio: string) => {
  if (tipoEspacio === 'HABITACION') return 'Habitacion';
  if (tipoEspacio === 'ZONA_COMUN') return 'Zona comun';
  return 'Espacio';
};

const serializarZona = (zona: {
  id: number;
  nombre: string;
  peso: number;
  activa: boolean;
  habitacion: {
    id: number;
    nombre: string;
    tipo: TipoHabitacion;
    es_habitable: boolean;
    inquilino: { id: number; nombre: string; apellidos: string | null } | null;
  } | null;
  asignaciones_fijas: Array<{
    id: number;
    habitacion: {
      id: number;
      nombre: string;
      tipo: TipoHabitacion;
      es_habitable: boolean;
      inquilino: { id: number; nombre: string; apellidos: string | null } | null;
    };
  }>;
}) => ({
  id: zona.id,
  nombre: zona.nombre,
  peso: zona.peso,
  activa: zona.activa,
  tipo_espacio: obtenerTipoEspacio(zona.habitacion),
  habitacion: zona.habitacion
    ? {
        id: zona.habitacion.id,
        nombre: zona.habitacion.nombre,
        tipo: zona.habitacion.tipo,
        es_habitable: zona.habitacion.es_habitable,
        inquilino: zona.habitacion.inquilino,
      }
    : null,
  asignaciones_fijas: zona.asignaciones_fijas.map((asignacion) => ({
    id: asignacion.id,
    habitacion_id: asignacion.habitacion.id,
    habitacion: {
      id: asignacion.habitacion.id,
      nombre: asignacion.habitacion.nombre,
      tipo: asignacion.habitacion.tipo,
      es_habitable: asignacion.habitacion.es_habitable,
      inquilino: asignacion.habitacion.inquilino,
    },
    responsable_actual: asignacion.habitacion.inquilino,
  })),
});

const buildTurnosWhere = ({
  viviendaId,
  inicio,
  fin,
  estado,
  acceso,
}: {
  viviendaId: number;
  inicio?: Date;
  fin?: Date;
  estado?: EstadoTurnoExport;
  acceso: { rol: 'CASERO'; miHabitacionId: null } | { rol: 'INQUILINO'; miHabitacionId: number };
}) => {
  const filtroBase = {
    zona: { vivienda_id: viviendaId },
    ...(estado ? { estado } : {}),
    ...(inicio || fin
      ? {
          fecha_inicio: {
            ...(inicio ? { gte: inicio } : {}),
            ...(fin ? { lte: fin } : {}),
          },
        }
      : {}),
  };

  if (acceso.rol === 'CASERO') {
    return filtroBase;
  }

  return {
    ...filtroBase,
    OR: [
      { habitacion_id: acceso.miHabitacionId },
      {
        zona: {
          OR: [
            { habitacion_id: null },
            {
              habitacion: {
                NOT: {
                  tipo: TipoHabitacion.DORMITORIO,
                  es_habitable: true,
                },
              },
            },
          ],
        },
      },
    ],
  };
};

const serializarTurno = (turno: {
  id: number;
  usuario_id: number | null;
  habitacion_id: number;
  zona_id: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  estado: EstadoTurnoExport;
  zona: {
    id: number;
    nombre: string;
    peso: number;
    habitacion: {
      id: number;
      nombre: string;
      tipo: TipoHabitacion;
      es_habitable: boolean;
      inquilino: { id: number; nombre: string; apellidos: string | null } | null;
    } | null;
  };
  habitacion: {
    id: number;
    nombre: string;
    tipo: TipoHabitacion;
    es_habitable: boolean;
    inquilino: { id: number; nombre: string; apellidos: string | null } | null;
  };
  usuario: { id: number; nombre: string; apellidos: string | null } | null;
}) => ({
  id: turno.id,
  usuario_id: turno.usuario_id,
  habitacion_id: turno.habitacion_id,
  zona_id: turno.zona_id,
  fecha_inicio: turno.fecha_inicio,
  fecha_fin: turno.fecha_fin,
  estado: turno.estado,
  tipo_espacio: obtenerTipoEspacio(turno.zona.habitacion),
  zona: {
    id: turno.zona.id,
    nombre: turno.zona.nombre,
    peso: turno.zona.peso,
    habitacion: turno.zona.habitacion,
  },
  habitacion: {
    id: turno.habitacion.id,
    nombre: turno.habitacion.nombre,
    tipo: turno.habitacion.tipo,
    es_habitable: turno.habitacion.es_habitable,
    inquilino: turno.habitacion.inquilino,
  },
  responsable_actual: turno.habitacion.inquilino,
  usuario: turno.usuario,
});

export const crearZona: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);
  const { nombre, peso, habitacion_id } = req.body as {
    nombre?: string;
    peso: number;
    habitacion_id?: number | null;
  };

  if (peso === undefined || peso === null) {
    res.status(400).json({ error: 'peso es obligatorio.' });
    return;
  }
  if (typeof peso !== 'number' || peso <= 0) {
    res.status(400).json({ error: 'peso debe ser un numero positivo.' });
    return;
  }

  const vivienda = await verificarPropiedadVivienda(viviendaId, req.usuario!.id);
  if (!vivienda) {
    res.status(403).json({ error: 'No tienes permiso sobre esta vivienda.' });
    return;
  }

  let habitacionObjetivo: {
    id: number;
    nombre: string;
  } | null = null;

  if (habitacion_id !== undefined && habitacion_id !== null) {
    habitacionObjetivo = await prisma.habitacion.findFirst({
      where: { id: habitacion_id, vivienda_id: viviendaId },
      select: { id: true, nombre: true },
    });

    if (!habitacionObjetivo) {
      res.status(404).json({ error: 'La habitacion objetivo no existe en esta vivienda.' });
      return;
    }
  }

  const nombreFinal = nombre?.trim() || habitacionObjetivo?.nombre;
  if (!nombreFinal) {
    res.status(400).json({ error: 'nombre es obligatorio cuando no se vincula una habitacion.' });
    return;
  }

  const zona = await prisma.zonaLimpieza.create({
    data: {
      vivienda_id: viviendaId,
      habitacion_id: habitacionObjetivo?.id ?? null,
      nombre: nombreFinal,
      peso,
    },
    include: {
      habitacion: {
        include: {
          inquilino: { select: { id: true, nombre: true, apellidos: true } },
        },
      },
      asignaciones_fijas: {
        include: {
          habitacion: {
            include: {
              inquilino: { select: { id: true, nombre: true, apellidos: true } },
            },
          },
        },
      },
    },
  });

  res.status(201).json(serializarZona(zona));
};

export const listarZonas: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);

  const vivienda = await verificarPropiedadVivienda(viviendaId, req.usuario!.id);
  if (!vivienda) {
    res.status(403).json({ error: 'No tienes permiso sobre esta vivienda.' });
    return;
  }

  const zonas = await prisma.zonaLimpieza.findMany({
    where: { vivienda_id: viviendaId },
    include: {
      habitacion: {
        include: {
          inquilino: { select: { id: true, nombre: true, apellidos: true } },
        },
      },
      asignaciones_fijas: {
        include: {
          habitacion: {
            include: {
              inquilino: { select: { id: true, nombre: true, apellidos: true } },
            },
          },
        },
      },
    },
    orderBy: [{ activa: 'desc' }, { id: 'asc' }],
  });

  res.status(200).json(zonas.map(serializarZona));
};

export const actualizarZona: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);
  const zonaId = parseInt(req.params['zonaId'] as string, 10);
  const { nombre, peso, activa, habitacion_id } = req.body as {
    nombre?: string;
    peso?: number;
    activa?: boolean;
    habitacion_id?: number | null;
  };

  const vivienda = await verificarPropiedadVivienda(viviendaId, req.usuario!.id);
  if (!vivienda) {
    res.status(403).json({ error: 'No tienes permiso sobre esta vivienda.' });
    return;
  }

  const zona = await prisma.zonaLimpieza.findFirst({ where: { id: zonaId, vivienda_id: viviendaId } });
  if (!zona) {
    res.status(404).json({ error: 'Zona no encontrada.' });
    return;
  }

  if (peso !== undefined && (typeof peso !== 'number' || peso <= 0)) {
    res.status(400).json({ error: 'peso debe ser un numero positivo.' });
    return;
  }

  let habitacionObjetivoId = zona.habitacion_id;
  let nombreFinal = nombre?.trim() ?? zona.nombre;

  if (habitacion_id !== undefined) {
    if (habitacion_id === null) {
      habitacionObjetivoId = null;
    } else {
      const habitacionObjetivo = await prisma.habitacion.findFirst({
        where: { id: habitacion_id, vivienda_id: viviendaId },
        select: { id: true, nombre: true },
      });

      if (!habitacionObjetivo) {
        res.status(404).json({ error: 'La habitacion objetivo no existe en esta vivienda.' });
        return;
      }

      habitacionObjetivoId = habitacionObjetivo.id;
      if (!nombre?.trim()) {
        nombreFinal = habitacionObjetivo.nombre;
      }
    }
  }

  if (!nombreFinal) {
    res.status(400).json({ error: 'nombre es obligatorio cuando no se vincula una habitacion.' });
    return;
  }

  const zonaActualizada = await prisma.zonaLimpieza.update({
    where: { id: zonaId },
    data: {
      nombre: nombreFinal,
      peso: peso ?? zona.peso,
      activa: activa !== undefined ? activa : zona.activa,
      habitacion_id: habitacionObjetivoId,
    },
    include: {
      habitacion: {
        include: {
          inquilino: { select: { id: true, nombre: true, apellidos: true } },
        },
      },
      asignaciones_fijas: {
        include: {
          habitacion: {
            include: {
              inquilino: { select: { id: true, nombre: true, apellidos: true } },
            },
          },
        },
      },
    },
  });

  res.status(200).json(serializarZona(zonaActualizada));
};

export const asignarZonaFija: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);
  const zonaId = parseInt(req.params['zonaId'] as string, 10);
  const { habitacion_ids } = req.body as { habitacion_ids: number[] };

  if (!Array.isArray(habitacion_ids)) {
    res.status(400).json({ error: 'habitacion_ids debe ser un array de numeros.' });
    return;
  }

  const vivienda = await verificarPropiedadVivienda(viviendaId, req.usuario!.id);
  if (!vivienda) {
    res.status(403).json({ error: 'No tienes permiso sobre esta vivienda.' });
    return;
  }

  const zona = await prisma.zonaLimpieza.findFirst({ where: { id: zonaId, vivienda_id: viviendaId } });
  if (!zona) {
    res.status(404).json({ error: 'Zona no encontrada.' });
    return;
  }

  if (habitacion_ids.length > 0) {
    const habitaciones = await prisma.habitacion.findMany({
      where: {
        vivienda_id: viviendaId,
        id: { in: habitacion_ids },
        es_habitable: true,
        tipo: TipoHabitacion.DORMITORIO,
      },
      select: { id: true },
    });
    const validos = new Set(habitaciones.map((habitacion) => habitacion.id));
    const invalidos = habitacion_ids.filter((habitacionId) => !validos.has(habitacionId));
    if (invalidos.length > 0) {
      res.status(403).json({ error: 'Una o mas habitaciones no pueden ser responsables fijas.' });
      return;
    }
  }

  const asignaciones = await prisma.$transaction(async (tx) => {
    await tx.asignacionLimpiezaFija.deleteMany({ where: { zona_id: zonaId } });
    if (habitacion_ids.length === 0) return [];
    await tx.asignacionLimpiezaFija.createMany({
      data: habitacion_ids.map((habitacionId) => ({ zona_id: zonaId, habitacion_id: habitacionId })),
    });
    return tx.asignacionLimpiezaFija.findMany({
      where: { zona_id: zonaId },
      include: {
        habitacion: {
          include: {
            inquilino: { select: { id: true, nombre: true, apellidos: true } },
          },
        },
      },
    });
  });

  res.status(200).json(
    asignaciones.map((asignacion) => ({
      id: asignacion.id,
      habitacion_id: asignacion.habitacion.id,
      habitacion: {
        id: asignacion.habitacion.id,
        nombre: asignacion.habitacion.nombre,
        tipo: asignacion.habitacion.tipo,
        es_habitable: asignacion.habitacion.es_habitable,
        inquilino: asignacion.habitacion.inquilino,
      },
      responsable_actual: asignacion.habitacion.inquilino,
    })),
  );
};

export const eliminarZona: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);
  const zonaId = parseInt(req.params['zonaId'] as string, 10);

  const vivienda = await verificarPropiedadVivienda(viviendaId, req.usuario!.id);
  if (!vivienda) {
    res.status(403).json({ error: 'No tienes permiso sobre esta vivienda.' });
    return;
  }

  const zona = await prisma.zonaLimpieza.findFirst({ where: { id: zonaId, vivienda_id: viviendaId } });
  if (!zona) {
    res.status(404).json({ error: 'Zona no encontrada.' });
    return;
  }

  await prisma.$transaction([
    prisma.turnoLimpieza.deleteMany({ where: { zona_id: zonaId } }),
    prisma.asignacionLimpiezaFija.deleteMany({ where: { zona_id: zonaId } }),
    prisma.zonaLimpieza.delete({ where: { id: zonaId } }),
  ]);

  res.status(204).send();
};

export const quitarAsignacionFija: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);
  const zonaId = parseInt(req.params['zonaId'] as string, 10);

  const vivienda = await verificarPropiedadVivienda(viviendaId, req.usuario!.id);
  if (!vivienda) {
    res.status(403).json({ error: 'No tienes permiso sobre esta vivienda.' });
    return;
  }

  const zona = await prisma.zonaLimpieza.findFirst({ where: { id: zonaId, vivienda_id: viviendaId } });
  if (!zona) {
    res.status(404).json({ error: 'Zona no encontrada.' });
    return;
  }

  const asignacion = await prisma.asignacionLimpiezaFija.findFirst({ where: { zona_id: zonaId } });
  if (!asignacion) {
    res.status(404).json({ error: 'Esta zona no tiene asignacion fija.' });
    return;
  }

  await prisma.asignacionLimpiezaFija.delete({ where: { id: asignacion.id } });
  res.status(204).send();
};

export const obtenerTurnos: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);
  const acceso = await obtenerContextoAcceso(viviendaId, req.usuario!.id);

  if (!acceso) {
    res.status(403).json({ error: 'No tienes acceso a esta vivienda.' });
    return;
  }

  const base = req.query['fecha'] ? new Date(req.query['fecha'] as string) : new Date();
  const offset = (base.getDay() + 6) % 7;
  const lunes = new Date(base);
  lunes.setDate(base.getDate() - offset);
  lunes.setHours(0, 0, 0, 0);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  domingo.setHours(23, 59, 59, 999);

  const turnos = await prisma.turnoLimpieza.findMany({
    where: buildTurnosWhere({ viviendaId, inicio: lunes, fin: domingo, acceso }),
    include: {
      zona: {
        select: {
          id: true,
          nombre: true,
          peso: true,
          habitacion: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              es_habitable: true,
              inquilino: { select: { id: true, nombre: true, apellidos: true } },
            },
          },
        },
      },
      habitacion: {
        select: {
          id: true,
          nombre: true,
          tipo: true,
          es_habitable: true,
          inquilino: { select: { id: true, nombre: true, apellidos: true } },
        },
      },
      usuario: { select: { id: true, nombre: true, apellidos: true } },
    },
    orderBy: [{ fecha_inicio: 'asc' }, { habitacion_id: 'asc' }, { zona: { peso: 'desc' } }],
  });

  res.json(turnos.map(serializarTurno));
};

export const exportarTurnos: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);
  const acceso = await obtenerContextoAcceso(viviendaId, req.usuario!.id);

  if (!acceso) {
    res.status(403).json({ error: 'No tienes acceso a esta vivienda.' });
    return;
  }

  const vivienda = await prisma.vivienda.findUnique({
    where: { id: viviendaId },
    select: { id: true, alias_nombre: true },
  });

  if (!vivienda) {
    res.status(404).json({ error: 'Vivienda no encontrada.' });
    return;
  }

  const estado = typeof req.query['estado'] === 'string' ? req.query['estado'].toUpperCase() : undefined;
  if (estado && !ESTADOS_EXPORTABLES.has(estado as EstadoTurnoExport)) {
    res.status(400).json({ error: 'estado no valido para exportar limpiezas.' });
    return;
  }

  const fechaDesde = normalizarFechaDia(req.query['fechaDesde']);
  const fechaHasta = normalizarFechaDia(req.query['fechaHasta'], true);
  const semana = !fechaDesde && !fechaHasta ? obtenerSemanaDesdeFecha(req.query['fecha']) : null;

  if (req.query['fecha'] && !semana) {
    res.status(400).json({ error: 'Usa fecha con formato YYYY-MM-DD.' });
    return;
  }

  if ((req.query['fechaDesde'] && !fechaDesde) || (req.query['fechaHasta'] && !fechaHasta)) {
    res.status(400).json({ error: 'Usa fechas con formato YYYY-MM-DD.' });
    return;
  }

  const inicio = fechaDesde ?? semana?.inicio;
  const fin = fechaHasta ?? semana?.fin;

  if (inicio && fin && inicio > fin) {
    res.status(400).json({ error: 'fechaDesde no puede ser posterior a fechaHasta.' });
    return;
  }

  const turnos = await prisma.turnoLimpieza.findMany({
    where: buildTurnosWhere({
      viviendaId,
      inicio: inicio ?? undefined,
      fin: fin ?? undefined,
      estado: estado as EstadoTurnoExport | undefined,
      acceso,
    }),
    include: {
      zona: {
        select: {
          nombre: true,
          habitacion: {
            select: {
              tipo: true,
              es_habitable: true,
            },
          },
        },
      },
      habitacion: {
        select: {
          nombre: true,
          inquilino: { select: { nombre: true, apellidos: true } },
        },
      },
    },
    orderBy: [{ fecha_inicio: 'asc' }, { habitacion: { nombre: 'asc' } }, { zona: { nombre: 'asc' } }],
  });

  if (turnos.length === 0) {
    res.status(404).json({ error: 'No hay limpiezas para exportar con los filtros actuales.' });
    return;
  }

  const filas = turnos.map((turno) => ({
    espacio: turno.zona.nombre,
    tipoEspacio: etiquetaTipoEspacio(obtenerTipoEspacio(turno.zona.habitacion ?? null)),
    habitacionResponsable: turno.habitacion.nombre,
    responsableActual: nombreCompleto(turno.habitacion.inquilino),
    fecha: turno.fecha_inicio,
  }));

  const csv = generarCsvLimpiezas(filas);
  const fechaExportacion = new Date().toISOString().slice(0, 10);
  const viviendaSlug = limpiarNombreArchivo(vivienda.alias_nombre) || `vivienda-${vivienda.id}`;
  const nombreArchivo = `limpiezas-${viviendaSlug}-${fechaExportacion}.csv`;

  if (req.query['formato'] === 'base64') {
    res.status(200).json({
      nombreArchivo,
      mimeType: 'text/csv',
      contenidoBase64: generarBufferCsvExcel(csv).toString('base64'),
    });
    return;
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
  res.status(200).send(csv);
};

export const marcarTurnoHecho: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);
  const turnoId = parseInt(req.params['turnoId'] as string, 10);
  const usuarioId = req.usuario!.id;

  const turno = await prisma.turnoLimpieza.findFirst({
    where: { id: turnoId, zona: { vivienda_id: viviendaId } },
    include: {
      habitacion: {
        select: {
          inquilino_id: true,
        },
      },
    },
  });

  if (!turno) {
    res.status(404).json({ error: 'Turno no encontrado.' });
    return;
  }

  if (turno.habitacion.inquilino_id !== usuarioId) {
    const esCasero = await verificarPropiedadVivienda(viviendaId, usuarioId);
    if (!esCasero) {
      res.status(403).json({ error: 'Solo puedes marcar turnos de tu habitacion o del casero.' });
      return;
    }
  }

  const turnoActualizado = await prisma.turnoLimpieza.update({
    where: { id: turnoId },
    data: { estado: 'HECHO' },
    include: {
      zona: {
        select: {
          id: true,
          nombre: true,
          peso: true,
          habitacion: {
            select: {
              id: true,
              nombre: true,
              tipo: true,
              es_habitable: true,
              inquilino: { select: { id: true, nombre: true, apellidos: true } },
            },
          },
        },
      },
      habitacion: {
        select: {
          id: true,
          nombre: true,
          tipo: true,
          es_habitable: true,
          inquilino: { select: { id: true, nombre: true, apellidos: true } },
        },
      },
      usuario: { select: { id: true, nombre: true, apellidos: true } },
    },
  });

  res.json(serializarTurno(turnoActualizado));
};

export const generarTurnos: express.RequestHandler = async (req, res) => {
  const viviendaId = parseInt(req.params['id'] as string, 10);

  const vivienda = await verificarPropiedadVivienda(viviendaId, req.usuario!.id);
  if (!vivienda) {
    res.status(403).json({ error: 'No tienes permiso sobre esta vivienda.' });
    return;
  }

  try {
    await generarTurnosSemanales(viviendaId);
    res.status(201).json({ mensaje: 'Turnos de limpieza generados correctamente.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? 'No se pudieron generar los turnos.' });
  }
};
