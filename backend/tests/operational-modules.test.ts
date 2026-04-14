import assert from 'node:assert/strict';
import type express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, test, vi } from 'vitest';

type UsuarioTest = { id: number; rol: 'CASERO' | 'INQUILINO' };
type Handler = express.RequestHandler;

const prisma = vi.hoisted(() => ({
  vivienda: {
    findFirst: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: vivienda.findFirst');
    },
    findUnique: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: vivienda.findUnique');
    },
  },
  habitacion: {
    findFirst: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: habitacion.findFirst');
    },
    findMany: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: habitacion.findMany');
    },
  },
  itemInventario: {
    findUnique: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: itemInventario.findUnique');
    },
    findMany: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: itemInventario.findMany');
    },
    update: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: itemInventario.update');
    },
  },
  fotoAsset: {
    create: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: fotoAsset.create');
    },
  },
  anuncio: {
    create: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: anuncio.create');
    },
  },
  incidencia: {
    findUnique: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: incidencia.findUnique');
    },
    update: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: incidencia.update');
    },
  },
  turnoLimpieza: {
    findMany: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: turnoLimpieza.findMany');
    },
  },
}));

const enviarNotificacionPush = vi.hoisted(() => vi.fn());

vi.mock('../src/lib/prisma', () => ({ prisma }));
vi.mock('../src/services/notification.service', () => ({
  enviarNotificacionPush,
}));

const app = (await import('../src/app')).default;
const { protegerModuloVivienda } = await import('../src/middlewares/module.guard');
const {
  listarInventarioVivienda,
  marcarConformidadInventario,
  subirFotoInventario,
} = await import('../src/controllers/inventario.controller');
const { crearAnuncio } = await import('../src/controllers/anuncio.controller');
const { actualizarEstadoIncidencia } = await import('../src/controllers/incidencia.controller');
const { exportarTurnos } = await import('../src/controllers/limpieza.controller');

function resetPrisma() {
  enviarNotificacionPush.mockReset();
  prisma.vivienda.findFirst = async () => null;
  prisma.vivienda.findUnique = async () => null;
  prisma.habitacion.findFirst = async () => null;
  prisma.habitacion.findMany = async () => [];
  prisma.itemInventario.findUnique = async () => null;
  prisma.itemInventario.findMany = async () => [];
  prisma.itemInventario.update = async (args: unknown) => ({ id: 1, ...(args as { data: unknown }).data });
  prisma.fotoAsset.create = async (args: unknown) => ({ id: 1, ...(args as { data: unknown }).data });
  prisma.anuncio.create = async (args: unknown) => ({
    id: 1,
    ...(args as { data: Record<string, unknown> }).data,
    titulo: (args as { data: { titulo: string } }).data.titulo,
    autor: { nombre: 'Ada' },
  });
  prisma.incidencia.findUnique = async () => null;
  prisma.incidencia.update = async (args: unknown) => ({ id: 1, ...(args as { data: unknown }).data });
  prisma.turnoLimpieza.findMany = async () => [];
}

beforeEach(() => {
  resetPrisma();
});

function req({
  usuario,
  params = {},
  body = {},
  query = {},
  file,
}: {
  usuario: UsuarioTest;
  params?: Record<string, string>;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  file?: Partial<Express.Multer.File>;
}) {
  return {
    usuario,
    params,
    body,
    query,
    file,
  } as unknown as express.Request;
}

function res() {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    sent: false,
    headers: {} as Record<string, string>,
    setHeader(name: string, value: string) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
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
  return response as unknown as express.Response & typeof response;
}

async function invoke(handler: Handler, requestData: express.Request) {
  const response = res();
  await handler(requestData, response, () => undefined);
  return response;
}

const token = (usuario: UsuarioTest) => jwt.sign(usuario, process.env.JWT_SECRET!);

describe('modulos operativos desactivados', () => {
  test.each([
    ['limpieza', 'mod_limpieza'],
    ['inventario', 'mod_inventario'],
    ['gastos', 'mod_gastos'],
  ] as const)('bloquea %s si la vivienda lo tiene desactivado', async (modulo, campo) => {
    let nextCalled = false;
    prisma.vivienda.findFirst = async () => ({ [campo]: false });

    const middleware = protegerModuloVivienda(modulo);
    const response = res();
    await middleware(
      req({ usuario: { id: 20, rol: 'INQUILINO' }, params: { viviendaId: '10' } }),
      response,
      () => {
        nextCalled = true;
      },
    );

    assert.equal(response.statusCode, 403);
    assert.match((response.body as { error: string }).error, /desactivado/i);
    assert.equal(nextCalled, false);
  });
});

describe('inventario', () => {
  test('casero no puede listar inventario de vivienda ajena', async () => {
    let findManyCalled = false;
    prisma.itemInventario.findMany = async () => {
      findManyCalled = true;
      return [];
    };

    const response = await invoke(
      listarInventarioVivienda,
      req({ usuario: { id: 99, rol: 'CASERO' }, params: { viviendaId: '10' } }),
    );

    assert.equal(response.statusCode, 403);
    assert.equal(findManyCalled, false);
  });

  test('inquilino no puede dar conformidad a inventario ajeno', async () => {
    let updateCalled = false;
    prisma.itemInventario.findUnique = async () => ({
      id: 1,
      vivienda_id: 10,
      habitacion: null,
    });
    prisma.itemInventario.update = async () => {
      updateCalled = true;
      return {};
    };

    const response = await invoke(
      marcarConformidadInventario,
      req({ usuario: { id: 20, rol: 'INQUILINO' }, params: { itemId: '1' } }),
    );

    assert.equal(response.statusCode, 403);
    assert.equal(updateCalled, false);
  });

  test('subida de foto falla de forma explicita si Cloudinary no esta configurado', async () => {
    const response = await invoke(
      subirFotoInventario,
      req({
        usuario: { id: 20, rol: 'INQUILINO' },
        params: { itemId: '1' },
        file: { path: 'https://example.com/foto.jpg' },
      }),
    );

    assert.equal(response.statusCode, 500);
    assert.match((response.body as { error: string }).error, /cloudinary/i);
  });
});

describe('exportacion de limpieza', () => {
  test('no exporta turnos de viviendas ajenas', async () => {
    let findManyCalled = false;
    prisma.vivienda.findFirst = async () => null;
    prisma.turnoLimpieza.findMany = async () => {
      findManyCalled = true;
      return [];
    };

    const response = await invoke(
      exportarTurnos,
      req({ usuario: { id: 99, rol: 'CASERO' }, params: { id: '10' } }),
    );

    assert.equal(response.statusCode, 403);
    assert.equal(findManyCalled, false);
  });

  test('genera csv con cabeceras, filtros y nombre descargable', async () => {
    let filtros: unknown;
    prisma.vivienda.findFirst = async () => ({ id: 10, alias_nombre: 'Piso Centro' });
    prisma.turnoLimpieza.findMany = async (args: unknown) => {
      filtros = args;
      return [
        {
          id: 1,
          fecha_inicio: new Date('2026-04-13T00:00:00.000Z'),
          fecha_fin: new Date('2026-04-19T23:59:59.999Z'),
          estado: 'HECHO',
          zona: { nombre: 'Cocina' },
          usuario: {
            nombre: 'Ada',
            apellidos: 'Lovelace',
            habitacion: { nombre: 'Habitacion A', vivienda_id: 10 },
          },
        },
      ];
    };

    const response = await invoke(
      exportarTurnos,
      req({
        usuario: { id: 99, rol: 'CASERO' },
        params: { id: '10' },
        query: { fecha: '2026-04-14', estado: 'hecho' },
      }),
    );

    assert.equal(response.statusCode, 200);
    assert.match(response.headers['content-type'], /text\/csv/);
    assert.match(response.headers['content-disposition'], /limpiezas-piso-centro-/);
    assert.match(response.body as string, /"Vivienda";"Habitación o zona";"Fecha inicio"/);
    assert.match(response.body as string, /"Piso Centro";"Habitacion A - Cocina"/);
    assert.equal((filtros as { where: { estado: string } }).where.estado, 'HECHO');
  });

  test('responde claro si no hay turnos para los filtros actuales', async () => {
    prisma.vivienda.findFirst = async () => ({ id: 10, alias_nombre: 'Piso Centro' });
    prisma.turnoLimpieza.findMany = async () => [];

    const response = await invoke(
      exportarTurnos,
      req({ usuario: { id: 99, rol: 'CASERO' }, params: { id: '10' } }),
    );

    assert.equal(response.statusCode, 404);
    assert.match((response.body as { error: string }).error, /no hay limpiezas/i);
  });
});

describe('incidencias', () => {
  test('inquilino no puede cambiar estado de incidencia de otra vivienda', async () => {
    let updateCalled = false;
    prisma.incidencia.findUnique = async () => ({
      id: 9,
      vivienda_id: 10,
      creador_id: 21,
      habitacion_id: null,
      titulo: 'Caldera',
      vivienda: { casero_id: 99 },
      habitacion: null,
    });
    prisma.incidencia.update = async () => {
      updateCalled = true;
      return {};
    };

    const response = await invoke(
      actualizarEstadoIncidencia,
      req({
        usuario: { id: 20, rol: 'INQUILINO' },
        params: { id: '9' },
        body: { estado: 'RESUELTA' },
      }),
    );

    assert.equal(response.statusCode, 403);
    assert.equal(updateCalled, false);
  });
});

describe('uploads', () => {
  test('rechaza tipos no permitidos con respuesta JSON', async () => {
    prisma.itemInventario.findUnique = async () => ({ vivienda_id: 10, habitacion: null });
    prisma.vivienda.findFirst = async () => ({ mod_inventario: true });

    const response = await request(app)
      .post('/api/inventario/1/fotos')
      .set('Authorization', `Bearer ${token({ id: 99, rol: 'CASERO' })}`)
      .attach('foto', Buffer.from('texto'), {
        filename: 'nota.txt',
        contentType: 'text/plain',
      });

    assert.equal(response.status, 400);
    assert.match(response.body.error, /solo se permiten/i);
  });

  test('rechaza imagenes que superan el tamano maximo', async () => {
    prisma.itemInventario.findUnique = async () => ({ vivienda_id: 10, habitacion: null });
    prisma.vivienda.findFirst = async () => ({ mod_inventario: true });

    const response = await request(app)
      .post('/api/inventario/1/fotos')
      .set('Authorization', `Bearer ${token({ id: 99, rol: 'CASERO' })}`)
      .attach('foto', Buffer.alloc(8 * 1024 * 1024 + 1), {
        filename: 'foto.png',
        contentType: 'image/png',
      });

    assert.equal(response.status, 413);
    assert.match(response.body.error, /tamano maximo/i);
  });
});

describe('push fire-and-forget', () => {
  test('crear anuncio responde 201 aunque falle la notificacion push', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    enviarNotificacionPush.mockRejectedValueOnce(new Error('expo down'));
    prisma.vivienda.findFirst = async () => ({ id: 10 });
    prisma.habitacion.findMany = async () => [{ inquilino_id: 20 }];
    prisma.vivienda.findUnique = async () => ({ casero_id: 99 });

    const response = await invoke(
      crearAnuncio,
      req({
        usuario: { id: 99, rol: 'CASERO' },
        body: { titulo: 'Reunion', contenido: 'Hoy', vivienda_id: 10 },
      }),
    );

    assert.equal(response.statusCode, 201);
    assert.equal(enviarNotificacionPush.mock.calls.length, 1);
    await Promise.resolve();
    consoleError.mockRestore();
  });
});
