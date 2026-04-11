import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test, vi } from 'vitest';

const prisma = vi.hoisted(() => ({
  turnoLimpieza: {
    findFirst: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: turnoLimpieza.findFirst');
    },
    createMany: (_args: unknown): unknown => {
      throw new Error('Unexpected prisma call: turnoLimpieza.createMany');
    },
  },
  habitacion: {
    findMany: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: habitacion.findMany');
    },
  },
  zonaLimpieza: {
    findMany: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: zonaLimpieza.findMany');
    },
  },
  usuario: {
    update: (_args: unknown): unknown => {
      throw new Error('Unexpected prisma call: usuario.update');
    },
  },
  $transaction: async (_args: unknown): Promise<unknown> => {
    throw new Error('Unexpected prisma call: $transaction');
  },
}));

vi.mock('../src/lib/prisma', () => ({ prisma }));

const { generarTurnosSemanales } = await import('../src/services/limpieza.service');

type TurnoCreateMany = {
  data: Array<{
    usuario_id: number;
    zona_id: number;
    fecha_inicio: Date;
    fecha_fin: Date;
    estado: string;
  }>;
};

let createManyArgs: TurnoCreateMany | null = null;
let usuarioUpdateCalls: unknown[] = [];
let transactionArgs: unknown[] | null = null;

function resetPrisma() {
  createManyArgs = null;
  usuarioUpdateCalls = [];
  transactionArgs = null;

  prisma.turnoLimpieza.findFirst = async () => null;
  prisma.turnoLimpieza.createMany = (args: unknown) => {
    createManyArgs = args as TurnoCreateMany;
    return { operation: 'createMany', args };
  };
  prisma.habitacion.findMany = async () => [
    { inquilino: { id: 1, balance_limpieza: 0 } },
    { inquilino: { id: 2, balance_limpieza: 2 } },
  ];
  prisma.zonaLimpieza.findMany = async () => [
    { id: 10, peso: 3, asignaciones_fijas: [] },
    { id: 11, peso: 1, asignaciones_fijas: [] },
  ];
  prisma.usuario.update = (args: unknown) => {
    usuarioUpdateCalls.push(args);
    return { operation: 'usuario.update', args };
  };
  prisma.$transaction = async (args: unknown) => {
    transactionArgs = args as unknown[];
    return [];
  };
}

beforeEach(() => {
  resetPrisma();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-04-08T12:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('generacion de turnos de limpieza', () => {
  test('reparte zonas por carga efectiva y actualiza balances semanales', async () => {
    await generarTurnosSemanales(10);

    assert.deepEqual(
      createManyArgs?.data.map((turno) => ({
        usuario_id: turno.usuario_id,
        zona_id: turno.zona_id,
        estado: turno.estado,
      })),
      [
        { usuario_id: 1, zona_id: 10, estado: 'PENDIENTE' },
        { usuario_id: 2, zona_id: 11, estado: 'PENDIENTE' },
      ],
    );
    assert.equal(createManyArgs?.data[0]?.fecha_inicio.toISOString(), '2026-04-05T22:00:00.000Z');
    assert.equal(createManyArgs?.data[0]?.fecha_fin.toISOString(), '2026-04-12T21:59:59.999Z');
    assert.deepEqual(usuarioUpdateCalls, [
      { where: { id: 1 }, data: { balance_limpieza: 1 } },
      { where: { id: 2 }, data: { balance_limpieza: 1 } },
    ]);
    assert.equal(transactionArgs?.length, 3);
  });

  test('usa la semana siguiente al ultimo turno existente', async () => {
    prisma.turnoLimpieza.findFirst = async () => ({
      fecha_inicio: new Date('2026-04-13T00:00:00.000Z'),
    });

    await generarTurnosSemanales(10);

    assert.equal(createManyArgs?.data[0]?.fecha_inicio.toISOString(), '2026-04-19T22:00:00.000Z');
    assert.equal(createManyArgs?.data[0]?.fecha_fin.toISOString(), '2026-04-26T21:59:59.999Z');
  });

  test('lanza error si no hay inquilinos activos', async () => {
    prisma.habitacion.findMany = async () => [];

    await assert.rejects(
      () => generarTurnosSemanales(10),
      /no hay inquilinos activos/i,
    );
    assert.equal(createManyArgs, null);
  });
});
