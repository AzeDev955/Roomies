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
  contratoAlquiler: {
    aggregate: async (_args: unknown): Promise<unknown> => ({ _max: { version: null } }),
    create: async (_args: unknown): Promise<unknown> => ({}),
    findFirst: async (_args: unknown): Promise<unknown> => null,
    findMany: async (_args: unknown): Promise<unknown> => [],
    findUnique: async (_args: unknown): Promise<unknown> => null,
    update: async (_args: unknown): Promise<unknown> => ({}),
  },
  eventoContratoAlquiler: {
    create: async (_args: unknown): Promise<unknown> => ({}),
  },
  $transaction: async (callback: (tx: unknown) => Promise<unknown>) => callback(prisma),
}));

vi.mock('../src/lib/prisma', () => ({ prisma }));

const {
  crearContratoAlquiler,
  firmarContratoAlquiler,
  listarContratosVivienda,
} = await import('../src/controllers/contrato.controller');

function resetPrisma() {
  prisma.vivienda.findFirst = async () => null;
  prisma.habitacion.findFirst = async () => null;
  prisma.contratoAlquiler.aggregate = async () => ({ _max: { version: null } });
  prisma.contratoAlquiler.create = async (args: any) => ({ id: 1, ...args.data });
  prisma.contratoAlquiler.findFirst = async () => null;
  prisma.contratoAlquiler.findMany = async () => [];
  prisma.contratoAlquiler.findUnique = async () => null;
  prisma.contratoAlquiler.update = async (args: any) => ({ id: args.where.id, ...args.data });
  prisma.eventoContratoAlquiler.create = async () => ({});
}

beforeEach(() => {
  resetPrisma();
});

function req({
  usuario,
  params = {},
  body = {},
  file,
}: {
  usuario: UsuarioTest;
  params?: Record<string, string>;
  body?: Record<string, unknown>;
  file?: Partial<Express.Multer.File>;
}) {
  return {
    usuario,
    params,
    body,
    file,
    headers: { 'user-agent': 'vitest' },
    ip: '127.0.0.1',
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

const contratoFile = {
  originalname: 'contrato.pdf',
  mimetype: 'application/pdf',
  size: 18,
  path: 'https://cdn.test/contrato.pdf',
  buffer: Buffer.from('contrato version uno'),
};

describe('issue 337 - contratos de alquiler', () => {
  test('el casero crea una version pendiente con hash y evento trazable', async () => {
    let contratoCreate: any;
    let eventoCreate: any;

    prisma.vivienda.findFirst = async () => ({
      id: 7,
      habitaciones: [{ id: 3, inquilino_id: 20, precio: 450, es_habitable: true }],
    });
    prisma.contratoAlquiler.aggregate = async () => ({ _max: { version: 2 } });
    prisma.contratoAlquiler.create = async (args: any) => {
      contratoCreate = args;
      return { id: 99, ...args.data };
    };
    prisma.eventoContratoAlquiler.create = async (args: any) => {
      eventoCreate = args;
      return {};
    };
    prisma.contratoAlquiler.findUnique = async (_args: unknown) => ({ id: 99, estado: 'PENDIENTE_FIRMA' });

    const response = await invoke(
      crearContratoAlquiler,
      req({
        usuario: { id: 10, rol: 'CASERO' },
        params: { viviendaId: '7' },
        body: {
          inquilino_id: '20',
          habitacion_id: '3',
          renta_mensual: '450',
          fecha_inicio: '2026-06-01',
        },
        file: contratoFile,
      }),
    );

    assert.equal(response.statusCode, 201);
    assert.equal(contratoCreate.data.version, 3);
    assert.equal(contratoCreate.data.estado, 'PENDIENTE_FIRMA');
    assert.equal(contratoCreate.data.documento_hash.length, 64);
    assert.equal(eventoCreate.data.tipo, 'ENVIADO_FIRMA');
    assert.equal(eventoCreate.data.metadata.documento_hash, contratoCreate.data.documento_hash);
  });

  test('el inquilino solo firma contratos propios pendientes', async () => {
    let updateData: any;

    prisma.contratoAlquiler.findFirst = async () => ({
      id: 99,
      version: 1,
      estado: 'PENDIENTE_FIRMA',
      documento_hash: 'a'.repeat(64),
      inquilino: { id: 20, documento_identidad: '12345678Z' },
    });
    prisma.contratoAlquiler.update = async (args: any) => {
      updateData = args.data;
      return { id: args.where.id, ...args.data };
    };

    const response = await invoke(
      firmarContratoAlquiler,
      req({ usuario: { id: 20, rol: 'INQUILINO' }, params: { contratoId: '99' } }),
    );

    assert.equal(response.statusCode, 200);
    assert.equal(updateData.estado, 'FIRMADO');
    assert.equal(updateData.firma_usuario_id, 20);
    assert.equal(updateData.firma_documento_identidad, '12345678Z');
    assert.match(updateData.firma_origen_tecnico, /ua=vitest/);
  });

  test('el inquilino no lista contratos de otros ocupantes de la vivienda', async () => {
    let filtros: any;
    prisma.habitacion.findFirst = async () => ({ id: 3 });
    prisma.contratoAlquiler.findMany = async (args: any) => {
      filtros = args.where;
      return [];
    };

    const response = await invoke(
      listarContratosVivienda,
      req({ usuario: { id: 20, rol: 'INQUILINO' }, params: { viviendaId: '7' } }),
    );

    assert.equal(response.statusCode, 200);
    assert.deepEqual(filtros, { vivienda_id: 7, inquilino_id: 20 });
  });
});
