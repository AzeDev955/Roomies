import assert from 'node:assert/strict';
import type express from 'express';
import { beforeEach, describe, test, vi } from 'vitest';

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
    findMany: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: habitacion.findMany');
    },
    findFirst: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: habitacion.findFirst');
    },
  },
  gasto: {
    create: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: gasto.create');
    },
    findMany: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: gasto.findMany');
    },
    findFirst: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: gasto.findFirst');
    },
  },
  deuda: {
    findMany: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: deuda.findMany');
    },
    findFirst: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: deuda.findFirst');
    },
    update: async (_args: unknown): Promise<unknown> => {
      throw new Error('Unexpected prisma call: deuda.update');
    },
  },
  $transaction: async (_callback: unknown): Promise<unknown> => {
    throw new Error('Unexpected prisma call: $transaction');
  },
}));

vi.mock('../src/lib/prisma', () => ({ prisma }));

const { crearGastoDividido } = await import('../src/services/gasto.service');
const { crearCargosMensualesHabitacion } = await import('../src/services/gasto.service');
const {
  actualizarGasto,
  listarGastos,
  saldarDeuda,
} = await import('../src/controllers/gasto.controller');
const { listarCobrosVivienda } = await import('../src/controllers/cobros.controller');

let ultimoGastoCreate: {
  data: { deudas: { create: unknown[] }; importe: number; tipo?: string };
} | null = null;
let deudaUpdateCalls: unknown[] = [];
let ultimoGastoFindMany: unknown = null;
let ultimoGastoFindFirst: unknown = null;
let ultimaDeudaFindMany: unknown = null;
let transactionCalled = false;

function resetPrisma() {
  ultimoGastoCreate = null;
  deudaUpdateCalls = [];
  ultimoGastoFindMany = null;
  ultimoGastoFindFirst = null;
  ultimaDeudaFindMany = null;
  transactionCalled = false;

  prisma.vivienda.findUnique = async () => ({ casero_id: 99 });
  prisma.vivienda.findFirst = async () => null;
  prisma.habitacion.findMany = async () => [
    { inquilino_id: 1 },
    { inquilino_id: 2 },
    { inquilino_id: 3 },
  ];
  prisma.habitacion.findFirst = async () => null;
  prisma.gasto.create = async (args: unknown) => {
    ultimoGastoCreate = args as typeof ultimoGastoCreate;
    const data = (args as { data: { deudas: { create: unknown[] } } }).data;
    return {
      id: 10,
      ...data,
      deudas: data.deudas.create.map((deuda, index) => ({
        id: index + 1,
        gasto_id: 10,
        estado: 'PENDIENTE',
        ...deuda,
      })),
    };
  };
  prisma.gasto.findMany = async (args: unknown) => {
    ultimoGastoFindMany = args;
    return [];
  };
  prisma.gasto.findFirst = async (args: unknown) => {
    ultimoGastoFindFirst = args;
    return null;
  };
  prisma.deuda.findMany = async (args: unknown) => {
    ultimaDeudaFindMany = args;
    return [];
  };
  prisma.deuda.findFirst = async () => null;
  prisma.deuda.update = async (args: unknown) => {
    deudaUpdateCalls.push(args);
    return { id: 1, estado: 'PAGADA' };
  };
  prisma.$transaction = async (callback: unknown) => {
    transactionCalled = true;
    const tx = {
      deuda: {
        update: async (args: unknown) => {
          deudaUpdateCalls.push(args);
          return args;
        },
      },
      gasto: {
        update: async (args: unknown) => ({ id: 1, ...(args as { data: unknown }).data }),
      },
    };

    return (callback as (tx: typeof tx) => Promise<unknown>)(tx);
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

const importesCreados = () =>
  (ultimoGastoCreate?.data.deudas.create as Array<{ importe: number }>).map((deuda) => deuda.importe);

const suma = (importes: number[]) =>
  importes.reduce((total, importe) => Math.round((total + importe + Number.EPSILON) * 100) / 100, 0);

describe('modulo economico', () => {
  test('reparte automaticamente importes que no dividen exacto sin perder centimos', async () => {
    await crearGastoDividido({
      concepto: 'Luz',
      importe: 10,
      viviendaId: 1,
      pagadorId: 99,
    });

    assert.deepEqual(importesCreados(), [3.34, 3.33, 3.33]);
    assert.equal(suma(importesCreados()), 10);
    assert.equal(ultimoGastoCreate?.data.tipo, 'ENTRE_COMPANEROS');
  });

  test('marca las facturas del casero con tipo explicito', async () => {
    await crearGastoDividido({
      concepto: 'Factura luz',
      importe: 90,
      tipo: 'FACTURA_PUNTUAL',
      viviendaId: 1,
      pagadorId: 99,
    });

    assert.equal(ultimoGastoCreate?.data.tipo, 'FACTURA_PUNTUAL');
  });

  test('acepta reparto manual correcto con cuota cero sin crear deuda de importe cero', async () => {
    await crearGastoDividido({
      concepto: 'Agua',
      importe: 10,
      viviendaId: 1,
      pagadorId: 1,
      repartoManual: [
        { usuario_id: 1, importe: 4 },
        { usuario_id: 2, importe: 0 },
        { usuario_id: 3, importe: 6 },
      ],
    });

    assert.equal(ultimoGastoCreate?.data.importe, 10);
    assert.deepEqual(ultimoGastoCreate?.data.deudas.create, [
      { deudor_id: 3, acreedor_id: 1, importe: 6 },
    ]);
  });

  test('rechaza reparto manual con suma incorrecta', async () => {
    await assert.rejects(
      () =>
        crearGastoDividido({
          concepto: 'Gas',
          importe: 10,
          viviendaId: 1,
          pagadorId: 1,
          repartoManual: [
            { usuario_id: 1, importe: 4 },
            { usuario_id: 2, importe: 3 },
          ],
        }),
      /reparto manual suma/i,
    );

    assert.equal(ultimoGastoCreate, null);
  });

  test('rechaza reparto manual con usuario duplicado', async () => {
    await assert.rejects(
      () =>
        crearGastoDividido({
          concepto: 'Internet',
          importe: 12,
          viviendaId: 1,
          pagadorId: 1,
          repartoManual: [
            { usuario_id: 2, importe: 6 },
            { usuario_id: 2, importe: 6 },
          ],
        }),
      /duplicados/i,
    );
  });

  test('rechaza reparto manual con usuario ajeno a la vivienda', async () => {
    await assert.rejects(
      () =>
        crearGastoDividido({
          concepto: 'Compra',
          importe: 12,
          viviendaId: 1,
          pagadorId: 1,
          repartoManual: [
            { usuario_id: 1, importe: 6 },
            { usuario_id: 200, importe: 6 },
          ],
        }),
      /inquilinos activos/i,
    );
  });

  test('solo el deudor puede saldar una deuda', async () => {
    prisma.habitacion.findFirst = async () => ({ id: 1 });
    prisma.deuda.findFirst = async () => ({
      id: 7,
      deudor_id: 2,
      acreedor_id: 99,
      estado: 'PENDIENTE',
    });

    const res = await invoke(
      saldarDeuda,
      request({
        usuario: { id: 3, rol: 'INQUILINO' },
        params: { viviendaId: '1', deudaId: '7' },
      }),
    );

    assert.equal(res.statusCode, 403);
    assert.deepEqual(deudaUpdateCalls, []);
  });

  test('el casero solo lista gastos de facturacion propia, no gastos entre companeros', async () => {
    prisma.vivienda.findFirst = async () => ({ id: 1, casero_id: 99 });

    const res = await invoke(
      listarGastos,
      request({
        usuario: { id: 99, rol: 'CASERO' },
        params: { viviendaId: '1' },
      }),
    );

    assert.equal(res.statusCode, 200);
    assert.deepEqual(
      (ultimoGastoFindMany as { where: { tipo: { in: string[] } } }).where.tipo.in,
      ['FACTURA_PUNTUAL', 'FACTURA_MENSUAL', 'CARGO_RECURRENTE', 'ALQUILER_HABITACION'],
    );
  });

  test('el inquilino solo recibe gastos y deudas donde participa', async () => {
    prisma.habitacion.findFirst = async () => ({ id: 1 });

    const res = await invoke(
      listarGastos,
      request({
        usuario: { id: 2, rol: 'INQUILINO' },
        params: { viviendaId: '1' },
      }),
    );

    assert.equal(res.statusCode, 200);
    assert.deepEqual((ultimoGastoFindMany as { where: unknown }).where, {
      vivienda_id: 1,
      OR: [
        { pagador_id: 2 },
        { deudas: { some: { OR: [{ deudor_id: 2 }, { acreedor_id: 2 }] } } },
      ],
    });
    assert.deepEqual(
      (ultimoGastoFindMany as { include: { deudas: { where: unknown } } }).include.deudas.where,
      { OR: [{ deudor_id: 2 }, { acreedor_id: 2 }] },
    );
  });

  test('el dashboard de cobros excluye gastos entre companeros por tipo', async () => {
    prisma.vivienda.findUnique = async () => ({
      id: 1,
      alias_nombre: 'Piso Centro',
      direccion: 'Calle Luna 1',
      casero_id: 99,
    });

    const res = await invoke(
      listarCobrosVivienda,
      request({
        usuario: { id: 99, rol: 'CASERO' },
        params: { viviendaId: '1' },
      }),
    );

    assert.equal(res.statusCode, 200);
    assert.deepEqual(
      (ultimaDeudaFindMany as { where: { gasto: { tipo: { in: string[] } } } }).where.gasto.tipo.in,
      ['FACTURA_PUNTUAL', 'FACTURA_MENSUAL', 'CARGO_RECURRENTE', 'ALQUILER_HABITACION'],
    );
  });

  test('genera alquiler mensual de habitacion como deuda del inquilino con el casero', async () => {
    prisma.habitacion.findMany = async (args: unknown) => {
      if ((args as { select?: { precio?: boolean } }).select?.precio) {
        return [
          {
            id: 7,
            nombre: 'Habitacion azul',
            precio: 450,
            inquilino_id: 2,
            vivienda_id: 1,
            vivienda: { casero_id: 99, alias_nombre: 'Piso Centro' },
          },
        ];
      }

      return [{ inquilino_id: 2 }];
    };

    const resultado = await crearCargosMensualesHabitacion(new Date(2026, 3, 1));

    assert.deepEqual(resultado, {
      periodo: '2026-04',
      creados: 1,
      omitidosExistentes: 0,
      omitidosSinPrecio: 0,
      omitidosSinInquilino: 0,
    });
    assert.deepEqual((ultimoGastoFindFirst as { where: unknown }).where, {
      tipo: 'ALQUILER_HABITACION',
      periodo_facturacion: '2026-04',
      habitacion_cargo_id: 7,
      inquilino_cargo_id: 2,
    });
    assert.equal(ultimoGastoCreate?.data.tipo, 'ALQUILER_HABITACION');
    assert.equal(ultimoGastoCreate?.data.importe, 450);
    assert.deepEqual(ultimoGastoCreate?.data.deudas.create, [
      { deudor_id: 2, acreedor_id: 99, importe: 450 },
    ]);
  });

  test('no duplica alquiler mensual si ya existe para el mismo periodo habitacion e inquilino', async () => {
    prisma.habitacion.findMany = async (args: unknown) => {
      if ((args as { select?: { precio?: boolean } }).select?.precio) {
        return [
          {
            id: 7,
            nombre: 'Habitacion azul',
            precio: 450,
            inquilino_id: 2,
            vivienda_id: 1,
            vivienda: { casero_id: 99, alias_nombre: 'Piso Centro' },
          },
        ];
      }

      return [{ inquilino_id: 2 }];
    };
    prisma.gasto.findFirst = async (args: unknown) => {
      ultimoGastoFindFirst = args;
      return { id: 20 };
    };

    const resultado = await crearCargosMensualesHabitacion(new Date(2026, 3, 1));

    assert.equal(resultado.creados, 0);
    assert.equal(resultado.omitidosExistentes, 1);
    assert.equal(ultimoGastoCreate, null);
  });

  test('omite alquiler mensual sin precio y deja traza en consola', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    prisma.habitacion.findMany = async () => [
      {
        id: 8,
        nombre: 'Habitacion sin precio',
        precio: null,
        inquilino_id: 2,
        vivienda_id: 1,
        vivienda: { casero_id: 99, alias_nombre: 'Piso Centro' },
      },
    ];

    const resultado = await crearCargosMensualesHabitacion(new Date(2026, 3, 1));

    assert.equal(resultado.creados, 0);
    assert.equal(resultado.omitidosSinPrecio, 1);
    assert.equal(ultimoGastoCreate, null);
    assert.match(warn.mock.calls[0]?.[0] ?? '', /sin precio valido/i);
    warn.mockRestore();
  });

  test('el deudor puede saldar su propia deuda pendiente', async () => {
    prisma.habitacion.findFirst = async () => ({ id: 1 });
    prisma.deuda.findFirst = async () => ({
      id: 7,
      deudor_id: 2,
      acreedor_id: 99,
      estado: 'PENDIENTE',
    });

    const res = await invoke(
      saldarDeuda,
      request({
        usuario: { id: 2, rol: 'INQUILINO' },
        params: { viviendaId: '1', deudaId: '7' },
      }),
    );

    assert.equal(res.statusCode, 200);
    assert.deepEqual(deudaUpdateCalls, [{ where: { id: 7 }, data: { estado: 'PAGADA' } }]);
  });

  test('bloquea editar el importe de una factura si hay pagos registrados', async () => {
    prisma.vivienda.findFirst = async () => ({ id: 1, casero_id: 99 });
    prisma.gasto.findFirst = async () => ({
      id: 12,
      importe: 100,
      deudas: [{ id: 20, deudor_id: 2, estado: 'PAGADA' }],
    });

    const res = await invoke(
      actualizarGasto,
      request({
        usuario: { id: 99, rol: 'CASERO' },
        params: { viviendaId: '1', gastoId: '12' },
        body: { importe: 120 },
      }),
    );

    assert.equal(res.statusCode, 400);
    assert.equal(transactionCalled, false);
  });

  test('bloquea editar cualquier dato de una factura con pagos registrados', async () => {
    prisma.vivienda.findFirst = async () => ({ id: 1, casero_id: 99 });
    prisma.gasto.findFirst = async () => ({
      id: 12,
      importe: 100,
      deudas: [{ id: 20, deudor_id: 2, estado: 'PAGADA' }],
    });

    const res = await invoke(
      actualizarGasto,
      request({
        usuario: { id: 99, rol: 'CASERO' },
        params: { viviendaId: '1', gastoId: '12' },
        body: { concepto: 'Mensualidad revisada' },
      }),
    );

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, {
      error: 'Esta factura no puede modificarse porque ya existen pagos registrados.',
    });
    assert.equal(transactionCalled, false);
  });

  test('edita importes abiertos redistribuyendo en centimos exactos', async () => {
    prisma.vivienda.findFirst = async () => ({ id: 1, casero_id: 99 });
    prisma.gasto.findFirst = async () => ({
      id: 12,
      importe: 9,
      deudas: [
        { id: 20, deudor_id: 2, estado: 'PENDIENTE' },
        { id: 21, deudor_id: 3, estado: 'PENDIENTE' },
      ],
    });

    const res = await invoke(
      actualizarGasto,
      request({
        usuario: { id: 99, rol: 'CASERO' },
        params: { viviendaId: '1', gastoId: '12' },
        body: { importe: 10.01 },
      }),
    );

    assert.equal(res.statusCode, 200);
    assert.deepEqual(deudaUpdateCalls, [
      { where: { id: 20 }, data: { importe: 5.01 } },
      { where: { id: 21 }, data: { importe: 5 } },
    ]);
    assert.equal((res.body as { modificado_por_id: number }).modificado_por_id, 99);
    assert.ok((res.body as { fecha_modificacion: Date }).fecha_modificacion instanceof Date);
  });
});
