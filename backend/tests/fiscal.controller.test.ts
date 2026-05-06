import assert from 'node:assert/strict';
import type express from 'express';
import { beforeEach, describe, test, vi } from 'vitest';

type Handler = express.RequestHandler;
type UsuarioTest = { id: number; rol: 'CASERO' | 'INQUILINO' };

const fiscalService = vi.hoisted(() => ({
  obtenerResumenFiscalAnualVivienda: vi.fn(),
  obtenerFotoOcupacionFiscalVivienda: vi.fn(),
}));

vi.mock('../src/services/fiscal.service', () => fiscalService);

const { obtenerResumenFiscalVivienda } = await import('../src/controllers/fiscal.controller');

function request({
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

beforeEach(() => {
  fiscalService.obtenerResumenFiscalAnualVivienda.mockReset();
});

describe('fiscal.controller', () => {
  test('rechaza el resumen anual para inquilinos', async () => {
    const res = await invoke(
      obtenerResumenFiscalVivienda,
      request({
        usuario: { id: 12, rol: 'INQUILINO' },
        params: { viviendaId: '1', ejercicio: '2026' },
      }),
    );

    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.body, { error: 'Solo el casero propietario puede consultar el resumen fiscal.' });
    assert.equal(fiscalService.obtenerResumenFiscalAnualVivienda.mock.calls.length, 0);
  });

  test('devuelve 404 cuando la vivienda no pertenece al casero', async () => {
    fiscalService.obtenerResumenFiscalAnualVivienda.mockResolvedValueOnce(null);

    const res = await invoke(
      obtenerResumenFiscalVivienda,
      request({
        usuario: { id: 99, rol: 'CASERO' },
        params: { viviendaId: '7', ejercicio: '2026' },
      }),
    );

    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.body, { error: 'Vivienda no encontrada.' });
    assert.deepEqual(fiscalService.obtenerResumenFiscalAnualVivienda.mock.calls[0], [7, 99, 2026]);
  });

  test('devuelve el resumen fiscal anual para el casero propietario', async () => {
    const resumen = {
      ejercicio: 2026,
      vivienda: { id: 7 },
      totales: {
        ingresos: { emitido: 100, cobrado: 60, pendiente: 40, anulado: 0, por_tipo: {} },
      },
      lineas: [],
      advertencias: [],
    };
    fiscalService.obtenerResumenFiscalAnualVivienda.mockResolvedValueOnce(resumen);

    const res = await invoke(
      obtenerResumenFiscalVivienda,
      request({
        usuario: { id: 99, rol: 'CASERO' },
        params: { viviendaId: '7', ejercicio: '2026' },
      }),
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.body, resumen);
    assert.deepEqual(fiscalService.obtenerResumenFiscalAnualVivienda.mock.calls[0], [7, 99, 2026]);
  });
});
