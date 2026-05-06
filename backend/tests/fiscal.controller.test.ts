import assert from 'node:assert/strict';
import type express from 'express';
import { beforeEach, describe, test, vi } from 'vitest';

type Handler = express.RequestHandler;
type UsuarioTest = { id: number; rol: 'CASERO' | 'INQUILINO' };

const fiscalService = vi.hoisted(() => ({
  obtenerResumenFiscalAnualVivienda: vi.fn(),
  obtenerFotoOcupacionFiscalVivienda: vi.fn(),
  obtenerDossierFiscalVivienda: vi.fn(),
  generarBufferCsvExcel: vi.fn((csv: string) => Buffer.from(`excel:${csv}`)),
}));

vi.mock('../src/services/fiscal.service', () => fiscalService);

const {
  exportarDossierFiscalVivienda,
  obtenerOcupacionFiscalVivienda,
  obtenerResumenFiscalVivienda,
} = await import('../src/controllers/fiscal.controller');

function request({
  usuario,
  params = {},
  query = {},
}: {
  usuario: UsuarioTest;
  params?: Record<string, string>;
  query?: Record<string, string>;
}) {
  return {
    usuario,
    params,
    query,
  } as unknown as express.Request;
}

function response() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    sent: undefined as unknown,
    headers: {} as Record<string, string>,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(nombre: string, valor: string) {
      this.headers[nombre] = valor;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    send(payload: unknown) {
      this.sent = payload;
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
  fiscalService.obtenerFotoOcupacionFiscalVivienda.mockReset();
  fiscalService.obtenerDossierFiscalVivienda.mockReset();
  fiscalService.generarBufferCsvExcel.mockClear();
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

  test('rechaza ocupacion fiscal para inquilinos', async () => {
    const res = await invoke(
      obtenerOcupacionFiscalVivienda,
      request({
        usuario: { id: 12, rol: 'INQUILINO' },
        params: { viviendaId: '1' },
        query: { ejercicio: '2026' },
      }),
    );

    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.body, { error: 'Solo el casero puede consultar la ocupacion fiscal.' });
    assert.equal(fiscalService.obtenerFotoOcupacionFiscalVivienda.mock.calls.length, 0);
  });

  test('rechaza exportar dossier fiscal para inquilinos', async () => {
    const res = await invoke(
      exportarDossierFiscalVivienda,
      request({
        usuario: { id: 12, rol: 'INQUILINO' },
        params: { viviendaId: '1', ejercicio: '2026' },
      }),
    );

    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.body, { error: 'Solo el casero propietario puede exportar el dossier fiscal.' });
    assert.equal(fiscalService.obtenerDossierFiscalVivienda.mock.calls.length, 0);
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

  test('exporta dossier fiscal como csv descargable', async () => {
    fiscalService.obtenerDossierFiscalVivienda.mockResolvedValueOnce({
      nombreArchivo: 'dossier-fiscal-piso-centro-2026-2026-05-06.csv',
      mimeType: 'text/csv',
      contenido: '\uFEFF# RESUMEN\r\n# DETALLE',
      columnas: {
        resumen: ['Clave', 'Valor', 'Moneda', 'Notas'],
        detalle: ['Linea ID', 'Advertencias'],
      },
    });

    const res = await invoke(
      exportarDossierFiscalVivienda,
      request({
        usuario: { id: 99, rol: 'CASERO' },
        params: { viviendaId: '7', ejercicio: '2026' },
      }),
    );

    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['Content-Type'], 'text/csv; charset=utf-8');
    assert.equal(
      res.headers['Content-Disposition'],
      'attachment; filename="dossier-fiscal-piso-centro-2026-2026-05-06.csv"',
    );
    assert.equal(res.sent, '\uFEFF# RESUMEN\r\n# DETALLE');
    assert.deepEqual(fiscalService.obtenerDossierFiscalVivienda.mock.calls[0], [7, 99, 2026]);
  });

  test('exporta dossier fiscal en base64 para escritura movil', async () => {
    fiscalService.obtenerDossierFiscalVivienda.mockResolvedValueOnce({
      nombreArchivo: 'dossier-fiscal-piso-centro-2026-2026-05-06.csv',
      mimeType: 'text/csv',
      contenido: 'csv',
      columnas: {
        resumen: ['Clave'],
        detalle: ['Linea ID'],
      },
    });

    const res = await invoke(
      exportarDossierFiscalVivienda,
      request({
        usuario: { id: 99, rol: 'CASERO' },
        params: { viviendaId: '7', ejercicio: '2026' },
        query: { formato: 'base64' },
      }),
    );

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, {
      nombreArchivo: 'dossier-fiscal-piso-centro-2026-2026-05-06.csv',
      mimeType: 'text/csv',
      columnas: {
        resumen: ['Clave'],
        detalle: ['Linea ID'],
      },
      contenidoBase64: Buffer.from('excel:csv').toString('base64'),
    });
    assert.deepEqual(fiscalService.generarBufferCsvExcel.mock.calls[0], ['csv']);
  });
});
