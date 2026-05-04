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
  gastoRecurrente: {
    findFirst: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: gastoRecurrente.findFirst');
    },
    update: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: gastoRecurrente.update');
    },
    delete: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: gastoRecurrente.delete');
    },
  },
}));

vi.mock('../src/lib/prisma', () => ({ prisma }));

const {
  actualizarGastoRecurrente,
  eliminarGastoRecurrente,
} = await import('../src/controllers/gasto-recurrente.controller');

let ultimoFindFirst: unknown = null;
let ultimoUpdate: unknown = null;
let ultimoDelete: unknown = null;

function resetPrisma() {
  ultimoFindFirst = null;
  ultimoUpdate = null;
  ultimoDelete = null;

  prisma.vivienda.findFirst = async () => ({ id: 1, casero_id: 99 });
  prisma.gastoRecurrente.findFirst = async (args: unknown) => {
    ultimoFindFirst = args;
    return { id: 12 };
  };
  prisma.gastoRecurrente.update = async (args: unknown) => {
    ultimoUpdate = args;
    return { id: 12, ...(args as { data: unknown }).data };
  };
  prisma.gastoRecurrente.delete = async (args: unknown) => {
    ultimoDelete = args;
    return { id: 12 };
  };
}

beforeEach(() => {
  resetPrisma();
});

function request({
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

function response() {
  const res = {
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

  return res as unknown as express.Response & typeof res;
}

async function invoke(handler: Handler, req: express.Request) {
  const res = response();
  await handler(req, res, () => undefined);
  return res;
}

describe('gastos recurrentes', () => {
  test('permite al casero actualizar un gasto fijo de su vivienda', async () => {
    const res = await invoke(
      actualizarGastoRecurrente,
      request({
        usuario: { id: 99, rol: 'CASERO' },
        params: { viviendaId: '1', gastoRecurrenteId: '12' },
        body: { concepto: 'Internet fibra plus', importe: 65, dia_del_mes: 7 },
      }),
    );

    assert.equal(res.statusCode, 200);
    assert.deepEqual((ultimoFindFirst as { where: unknown }).where, { id: 12, vivienda_id: 1 });
    assert.deepEqual((ultimoUpdate as { where: unknown; data: unknown }).where, { id: 12 });
    assert.deepEqual((ultimoUpdate as { data: unknown }).data, {
      concepto: 'Internet fibra plus',
      importe: 65,
      dia_del_mes: 7,
    });
  });

  test('rechaza editar gastos fijos de otra vivienda', async () => {
    prisma.vivienda.findFirst = async () => null;

    const res = await invoke(
      actualizarGastoRecurrente,
      request({
        usuario: { id: 50, rol: 'CASERO' },
        params: { viviendaId: '1', gastoRecurrenteId: '12' },
        body: { concepto: 'Internet' },
      }),
    );

    assert.equal(res.statusCode, 403);
    assert.equal(ultimoUpdate, null);
  });

  test('permite al casero eliminar un gasto fijo de su vivienda', async () => {
    const res = await invoke(
      eliminarGastoRecurrente,
      request({
        usuario: { id: 99, rol: 'CASERO' },
        params: { viviendaId: '1', gastoRecurrenteId: '12' },
      }),
    );

    assert.equal(res.statusCode, 200);
    assert.deepEqual(ultimoDelete, { where: { id: 12 } });
    assert.deepEqual(res.body, { ok: true, gasto_recurrente_id: 12 });
  });
});
