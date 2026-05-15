import assert from 'node:assert/strict';
import type express from 'express';
import { beforeEach, describe, test, vi } from 'vitest';

type UsuarioTest = { id: number; rol: 'CASERO' | 'INQUILINO' };

const prisma = vi.hoisted(() => ({
  vivienda: {
    findFirst: async (_args: unknown): Promise<unknown> => null,
  },
  habitacion: {
    findFirst: async (_args: unknown): Promise<unknown> => null,
  },
  itemInventario: {
    findMany: async (_args: unknown): Promise<unknown> => [],
    findUnique: async (_args: unknown): Promise<unknown> => null,
    update: async (_args: unknown): Promise<unknown> => ({}),
  },
}));

vi.mock('../src/lib/prisma', () => ({ prisma }));

const {
  listarInventarioVivienda,
  marcarConformidadInventario,
} = await import('../src/controllers/inventario.controller');

function resetPrisma() {
  prisma.vivienda.findFirst = async () => null;
  prisma.habitacion.findFirst = async () => null;
  prisma.itemInventario.findMany = async () => [];
  prisma.itemInventario.findUnique = async () => null;
  prisma.itemInventario.update = async (args: unknown) => ({
    id: 1,
    ...(args as { data: Record<string, unknown> }).data,
  });
}

beforeEach(() => {
  resetPrisma();
});

function req({
  usuario,
  params = {},
}: {
  usuario: UsuarioTest;
  params?: Record<string, string>;
}) {
  return {
    usuario,
    params,
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

async function invoke(handler: express.RequestHandler, requestData: express.Request) {
  const response = res();
  await handler(requestData, response, () => undefined);
  return response;
}

describe('issue 277 - inventario multi-tenant', () => {
  test('filtra el listado del inquilino a su habitacion y zonas comunes', async () => {
    let filtros: unknown;
    prisma.habitacion.findFirst = async () => ({ id: 20, vivienda_id: 10 });
    prisma.itemInventario.findMany = async (args: unknown) => {
      filtros = args;
      return [];
    };

    const response = await invoke(
      listarInventarioVivienda,
      req({ usuario: { id: 20, rol: 'INQUILINO' }, params: { viviendaId: '10' } }),
    );

    assert.equal(response.statusCode, 200);
    assert.deepEqual(
      (filtros as { where: unknown }).where,
      {
        OR: [
          { vivienda_id: 10 },
          { habitacion: { vivienda_id: 10, es_habitable: false } },
          { habitacion: { vivienda_id: 10, inquilino_id: 20 } },
        ],
      },
    );
  });

  test('bloquea la conformidad sobre items de otra habitacion aunque sea la misma vivienda', async () => {
    let updateCalled = false;
    prisma.habitacion.findFirst = async () => ({ id: 20, vivienda_id: 10 });
    prisma.itemInventario.findUnique = async () => ({
      id: 1,
      nombre: 'Mesilla',
      descripcion: null,
      estado: 'BUENO',
      revisado_por_inquilino: false,
      revisado_por_inquilino_id: null,
      revisado_por_inquilino_en: null,
      habitacion_id: 12,
      vivienda_id: null,
      fecha_registro: new Date('2026-04-12T10:00:00.000Z'),
      fotos: [],
      habitacion: {
        id: 12,
        nombre: 'Habitacion 2',
        tipo: 'DORMITORIO',
        vivienda_id: 10,
        es_habitable: true,
        inquilino_id: 21,
      },
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
    assert.match((response.body as { error: string }).error, /otra habitaci/i);
    assert.equal(updateCalled, false);
  });
});
