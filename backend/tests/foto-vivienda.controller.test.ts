import assert from 'node:assert/strict';
import type express from 'express';
import { beforeEach, describe, test, vi } from 'vitest';

type UsuarioTest = { id: number; rol: 'CASERO' | 'INQUILINO' };
type Handler = express.RequestHandler;

const prisma = vi.hoisted(() => ({
  vivienda: {
    findFirst: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: vivienda.findFirst');
    },
  },
  habitacion: {
    findFirst: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: habitacion.findFirst');
    },
  },
  fotoVivienda: {
    findMany: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: fotoVivienda.findMany');
    },
    findFirst: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: fotoVivienda.findFirst');
    },
    delete: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: fotoVivienda.delete');
    },
    update: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: fotoVivienda.update');
    },
    updateMany: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: fotoVivienda.updateMany');
    },
  },
  $transaction: async (callback: (tx: typeof prisma) => Promise<unknown>) => callback(prisma),
}));

vi.mock('../src/lib/prisma', () => ({ prisma }));
vi.mock('../src/services/media-cleanup.service', () => ({
  cleanupMediaReferences: async () => ({ attempted: 0, deleted: [], failed: [] }),
}));

const {
  listarFotosVivienda,
  actualizarFotoVivienda,
  eliminarFotoVivienda,
} = await import('../src/controllers/foto-vivienda.controller');

function resetPrisma() {
  prisma.vivienda.findFirst = async () => null;
  prisma.habitacion.findFirst = async () => null;
  prisma.fotoVivienda.findMany = async () => [];
  prisma.fotoVivienda.findFirst = async () => null;
  prisma.fotoVivienda.delete = async () => ({});
  prisma.fotoVivienda.update = async (args: unknown) => ({ id: 1, ...(args as { data: unknown }).data });
  prisma.fotoVivienda.updateMany = async () => ({ count: 0 });
}

beforeEach(() => {
  resetPrisma();
});

function req({
  usuario,
  params = {},
  body = {},
}: {
  usuario: UsuarioTest;
  params?: Record<string, string>;
  body?: Record<string, unknown>;
}) {
  return {
    usuario,
    params,
    body,
  } as unknown as express.Request;
}

function res() {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
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

describe('fotos de vivienda', () => {
  test('inquilino vinculado puede listar fotos resueltas de su vivienda', async () => {
    prisma.habitacion.findFirst = async () => ({ id: 2 });
    prisma.fotoVivienda.findMany = async () => [
      {
        id: 7,
        provider: 'external',
        key: 'legacy-key',
        url: 'https://cdn.roomies.test/vivienda.jpg',
        orden: 0,
        es_portada: true,
      },
    ];

    const response = await invoke(
      listarFotosVivienda,
      req({ usuario: { id: 20, rol: 'INQUILINO' }, params: { id: '10' } }),
    );

    assert.equal(response.statusCode, 200);
    assert.equal((response.body as Array<{ url: string }>)[0]?.url, 'https://cdn.roomies.test/vivienda.jpg');
  });

  test('casero no puede marcar portada en vivienda ajena', async () => {
    let updateCalled = false;
    prisma.fotoVivienda.update = async () => {
      updateCalled = true;
      return {};
    };

    const response = await invoke(
      actualizarFotoVivienda,
      req({
        usuario: { id: 99, rol: 'CASERO' },
        params: { id: '10', fotoId: '7' },
        body: { es_portada: true },
      }),
    );

    assert.equal(response.statusCode, 403);
    assert.equal(updateCalled, false);
  });

  test('borrar foto elimina el registro y responde ok para el casero propietario', async () => {
    let deleteCalled = false;
    prisma.vivienda.findFirst = async () => ({ id: 10 });
    prisma.fotoVivienda.findFirst = async () => ({
      id: 7,
      provider: 'external',
      key: 'legacy-key',
      variant: 'medium',
      es_portada: false,
    });
    prisma.fotoVivienda.delete = async () => {
      deleteCalled = true;
      return {};
    };

    const response = await invoke(
      eliminarFotoVivienda,
      req({ usuario: { id: 99, rol: 'CASERO' }, params: { id: '10', fotoId: '7' } }),
    );

    assert.equal(response.statusCode, 200);
    assert.equal(deleteCalled, true);
    assert.deepEqual(response.body, { ok: true, foto_id: 7 });
  });
});
