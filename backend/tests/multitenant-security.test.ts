import assert from 'node:assert/strict';
import type express from 'express';
import { test, vi } from 'vitest';

type UsuarioTest = { id: number; rol: 'CASERO' | 'INQUILINO' };
type Handler = express.RequestHandler;

const prisma = vi.hoisted(() => ({
  vivienda: {
    findUnique: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: vivienda.findUnique');
    },
    findFirst: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: vivienda.findFirst');
    },
  },
  habitacion: {
    findUnique: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: habitacion.findUnique');
    },
    findFirst: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: habitacion.findFirst');
    },
    update: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: habitacion.update');
    },
  },
  incidencia: {
    findUnique: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: incidencia.findUnique');
    },
    create: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: incidencia.create');
    },
  },
  anuncio: {
    findUnique: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: anuncio.findUnique');
    },
    delete: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: anuncio.delete');
    },
  },
}));

function unexpectedPrismaCall(method: string): never {
  throw new Error(`Unexpected prisma call: ${method}`);
}

vi.mock('../src/lib/prisma', () => ({ prisma }));
vi.mock('../src/services/notification.service', () => ({
  enviarNotificacionPush: async () => undefined,
}));

const { obtenerVivienda, editarHabitacion } = await import('../src/controllers/vivienda.controller');
const { obtenerMiVivienda, unirseHabitacion } = await import('../src/controllers/inquilino.controller');
const { crearIncidencia } = await import('../src/controllers/incidencia.controller');
const { eliminarAnuncio } = await import('../src/controllers/anuncio.controller');
const { protegerModuloVivienda } = await import('../src/middlewares/module.guard');

function resetPrisma() {
  prisma.vivienda.findUnique = async (_args: unknown): Promise<unknown> => unexpectedPrismaCall('vivienda.findUnique');
  prisma.vivienda.findFirst = async (_args: unknown): Promise<unknown> => unexpectedPrismaCall('vivienda.findFirst');
  prisma.habitacion.findUnique = async (_args: unknown): Promise<unknown> => unexpectedPrismaCall('habitacion.findUnique');
  prisma.habitacion.findFirst = async (_args: unknown): Promise<unknown> => unexpectedPrismaCall('habitacion.findFirst');
  prisma.habitacion.update = async (_args: unknown): Promise<unknown> => unexpectedPrismaCall('habitacion.update');
  prisma.incidencia.findUnique = async (_args: unknown): Promise<unknown> => unexpectedPrismaCall('incidencia.findUnique');
  prisma.incidencia.create = async (_args: unknown): Promise<unknown> => unexpectedPrismaCall('incidencia.create');
  prisma.anuncio.findUnique = async (_args: unknown): Promise<unknown> => unexpectedPrismaCall('anuncio.findUnique');
  prisma.anuncio.delete = async (_args: unknown): Promise<unknown> => unexpectedPrismaCall('anuncio.delete');
}

function request({
  usuario,
  params = {},
  body = {},
  query = {},
}: {
  usuario: UsuarioTest;
  params?: Record<string, string>;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
}) {
  return {
    usuario,
    params,
    body,
    query,
  } as unknown as express.Request;
}

function response() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    sent: false,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    send(payload?: unknown) {
      this.sent = true;
      this.body = payload;
      return this;
    },
  };
  return res as unknown as express.Response & typeof res;
}

async function invoke(handler: Handler, req: express.Request) {
  const res = response();
  await handler(req, res, () => undefined);
  return res;
}

test('casero no puede obtener una vivienda ajena', async () => {
  resetPrisma();
  prisma.vivienda.findUnique = async () => ({
    id: 1,
    casero_id: 99,
    habitaciones: [],
  });

  const res = await invoke(
    obtenerVivienda,
    request({ usuario: { id: 10, rol: 'CASERO' }, params: { id: '1' } }),
  );

  assert.equal(res.statusCode, 404);
});

test('inquilino no puede editar habitaciones de una vivienda de casero', async () => {
  resetPrisma();
  prisma.vivienda.findUnique = async () => ({
    id: 1,
    casero_id: 99,
  });

  const res = await invoke(
    editarHabitacion,
    request({
      usuario: { id: 20, rol: 'INQUILINO' },
      params: { id: '1', habId: '2' },
      body: { nombre: 'Dormitorio' },
    }),
  );

  assert.equal(res.statusCode, 403);
});

test('inquilino no ve precios privados ajenos ni codigos de invitacion', async () => {
  resetPrisma();
  prisma.habitacion.findFirst = async () => ({
    id: 1,
    vivienda_id: 10,
    inquilino_id: 20,
    precio: 500,
    codigo_invitacion: 'ROOM-OWN',
    vivienda: {
      id: 10,
      habitaciones: [
        { id: 1, inquilino_id: 20, precio: 500, codigo_invitacion: 'ROOM-OWN' },
        { id: 2, inquilino_id: 21, precio: 650, codigo_invitacion: 'ROOM-OTHER' },
      ],
    },
  });

  const res = await invoke(
    obtenerMiVivienda,
    request({ usuario: { id: 20, rol: 'INQUILINO' } }),
  );

  assert.equal(res.statusCode, 200);
  const body = res.body as {
    vivienda: { habitaciones: Array<{ precio: number | null; codigo_invitacion: string | null }> };
  };
  assert.deepEqual(
    body.vivienda.habitaciones.map((habitacion) => habitacion.precio),
    [500, null],
  );
  assert.deepEqual(
    body.vivienda.habitaciones.map((habitacion) => habitacion.codigo_invitacion),
    [null, null],
  );
});

test('unirse a habitacion quema el codigo usado y no devuelve el nuevo codigo', async () => {
  resetPrisma();
  let codigoRotado: string | null = null;

  prisma.habitacion.findUnique = async (args: unknown) => {
    const codigo = (args as { where: { codigo_invitacion: string } }).where.codigo_invitacion;
    if (codigo === 'ROOM-OLD') {
      return {
        id: 1,
        vivienda_id: 10,
        inquilino_id: null,
        precio: 500,
        codigo_invitacion: 'ROOM-OLD',
      };
    }

    return null;
  };
  prisma.habitacion.update = async (args: unknown) => {
    const data = (args as { data: { inquilino_id: number; codigo_invitacion: string } }).data;
    codigoRotado = data.codigo_invitacion;
    return {
      id: 1,
      vivienda_id: 10,
      inquilino_id: data.inquilino_id,
      precio: 500,
      codigo_invitacion: data.codigo_invitacion,
      vivienda: { id: 10, casero_id: 2 },
      inquilino: { nombre: 'Ada', apellidos: 'Lovelace' },
    };
  };

  const res = await invoke(
    unirseHabitacion,
    request({
      usuario: { id: 20, rol: 'INQUILINO' },
      body: { codigo_invitacion: 'ROOM-OLD' },
    }),
  );

  assert.equal(res.statusCode, 200);
  assert.match(codigoRotado ?? '', /^ROOM-[A-Z0-9]{6}$/);
  assert.notEqual(codigoRotado, 'ROOM-OLD');
  assert.equal((res.body as { habitacion: { codigo_invitacion: string | null } }).habitacion.codigo_invitacion, null);
});

test('inquilino no puede crear incidencia en dormitorio ajeno', async () => {
  resetPrisma();
  let findFirstCalls = 0;
  prisma.habitacion.findFirst = async () => {
    findFirstCalls += 1;
    if (findFirstCalls === 1) {
      return { id: 1, vivienda_id: 10, inquilino_id: 20 };
    }

    return { id: 2, vivienda_id: 10, tipo: 'DORMITORIO', inquilino_id: 21 };
  };

  const res = await invoke(
    crearIncidencia,
    request({
      usuario: { id: 20, rol: 'INQUILINO' },
      body: {
        titulo: 'Persiana rota',
        descripcion: 'No sube',
        habitacion_id: 2,
      },
    }),
  );

  assert.equal(res.statusCode, 403);
});

test('module guard valida pertenencia antes de revelar el estado del modulo', async () => {
  resetPrisma();
  let whereRecibido: unknown;
  prisma.vivienda.findFirst = async (args: unknown) => {
    whereRecibido = (args as { where: unknown }).where;
    return null;
  };

  const middleware = protegerModuloVivienda('gastos');
  let nextCalled = false;
  const res = response();
  await middleware(
    request({ usuario: { id: 20, rol: 'INQUILINO' }, params: { viviendaId: '10' } }),
    res,
    () => {
      nextCalled = true;
    },
  );

  assert.equal(res.statusCode, 403);
  assert.equal(nextCalled, false);
  assert.deepEqual(whereRecibido, {
    id: 10,
    habitaciones: { some: { inquilino_id: 20 } },
  });
});

test('autor que ya no pertenece a la vivienda no puede eliminar un anuncio antiguo', async () => {
  resetPrisma();
  prisma.anuncio.findUnique = async () => ({
    id: 1,
    vivienda_id: 10,
    autor_id: 20,
    vivienda: { casero_id: 99 },
  });
  prisma.habitacion.findFirst = async () => null;

  const res = await invoke(
    eliminarAnuncio,
    request({ usuario: { id: 20, rol: 'INQUILINO' }, params: { id: '1' } }),
  );

  assert.equal(res.statusCode, 403);
});
