import assert from 'node:assert/strict';
import request from 'supertest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const prisma = vi.hoisted(() => ({
  deuda: {
    findMany: vi.fn(),
  },
}));

const enviarNotificacion = vi.hoisted(() => vi.fn());

vi.mock('../src/lib/prisma', () => ({ prisma }));
vi.mock('../src/services/push.service', () => ({ enviarNotificacion }));

const app = (await import('../src/app')).default;
const { enviarRecordatoriosMorosos } = await import('../src/cron/recordatorios.cron');

beforeEach(() => {
  vi.clearAllMocks();
});

type MetodoHttp = 'get' | 'post' | 'patch' | 'put' | 'delete';

const rutasProtegidas: Array<{
  metodo: MetodoHttp;
  ruta: string;
  flujo: string;
}> = [
  { metodo: 'get', ruta: '/api/auth/me', flujo: 'restauracion de sesion' },
  { metodo: 'patch', ruta: '/api/auth/rol', flujo: 'seleccion de rol' },
  { metodo: 'get', ruta: '/api/viviendas', flujo: 'casero lista viviendas' },
  { metodo: 'post', ruta: '/api/viviendas', flujo: 'casero crea vivienda' },
  { metodo: 'get', ruta: '/api/viviendas/1', flujo: 'casero consulta vivienda' },
  { metodo: 'post', ruta: '/api/viviendas/1/habitaciones', flujo: 'casero crea habitacion' },
  { metodo: 'post', ruta: '/api/inquilino/unirse', flujo: 'inquilino se une con codigo' },
  { metodo: 'get', ruta: '/api/inquilino/vivienda', flujo: 'inquilino consulta vivienda' },
  { metodo: 'delete', ruta: '/api/inquilino/habitacion', flujo: 'inquilino abandona vivienda' },
  { metodo: 'get', ruta: '/api/incidencias', flujo: 'incidencias listar' },
  { metodo: 'post', ruta: '/api/incidencias', flujo: 'incidencias crear' },
  { metodo: 'patch', ruta: '/api/incidencias/1/estado', flujo: 'incidencias editar estado' },
  { metodo: 'get', ruta: '/api/anuncios', flujo: 'tablon listar' },
  { metodo: 'post', ruta: '/api/anuncios', flujo: 'tablon crear' },
  { metodo: 'delete', ruta: '/api/anuncios/1', flujo: 'tablon eliminar' },
  { metodo: 'get', ruta: '/api/viviendas/1/limpieza/zonas', flujo: 'limpieza listar zonas' },
  { metodo: 'post', ruta: '/api/viviendas/1/limpieza/zonas', flujo: 'limpieza crear zona' },
  { metodo: 'post', ruta: '/api/viviendas/1/limpieza/generar', flujo: 'limpieza generar turno' },
  { metodo: 'get', ruta: '/api/viviendas/1/limpieza/turnos/export', flujo: 'limpieza exportar turnos' },
  { metodo: 'patch', ruta: '/api/viviendas/1/limpieza/turnos/1/hecho', flujo: 'limpieza marcar estado' },
  { metodo: 'get', ruta: '/api/viviendas/1/gastos', flujo: 'gastos listar' },
  { metodo: 'post', ruta: '/api/viviendas/1/gastos', flujo: 'gastos crear y repartir' },
  { metodo: 'get', ruta: '/api/viviendas/1/deudas', flujo: 'deudas listar' },
  { metodo: 'patch', ruta: '/api/viviendas/1/deudas/1/saldar', flujo: 'deudas saldar' },
  { metodo: 'get', ruta: '/api/viviendas/1/cobros', flujo: 'cobros consultar' },
  { metodo: 'get', ruta: '/api/viviendas/1/gastos-recurrentes', flujo: 'mensualidades listar' },
  { metodo: 'post', ruta: '/api/viviendas/1/gastos-recurrentes', flujo: 'mensualidades crear' },
  { metodo: 'get', ruta: '/api/viviendas/1/inventario', flujo: 'inventario listar' },
  { metodo: 'post', ruta: '/api/viviendas/1/inventario', flujo: 'inventario crear item' },
  { metodo: 'patch', ruta: '/api/inventario/1/conformidad', flujo: 'inventario conformidad' },
  { metodo: 'patch', ruta: '/api/usuarios/me/push-token', flujo: 'push token actual' },
  { metodo: 'put', ruta: '/api/usuarios/push-token', flujo: 'push token legacy' },
];

const ejecutarRuta = (metodo: MetodoHttp, ruta: string) => request(app)[metodo](ruta);

describe('regresion final backend', () => {
  test.each(rutasProtegidas)('$flujo exige autenticacion y no devuelve 404', async ({ metodo, ruta }) => {
    const response = await ejecutarRuta(metodo, ruta);

    expect(response.status).toBe(401);
    expect(response.body.error).toMatch(/token/i);
  });

  test.each([
    ['/api/auth/register', 'registro'],
    ['/api/auth/login', 'login'],
    ['/api/auth/google', 'login google'],
  ])('%s valida payload publico de %s', async (ruta) => {
    const response = await request(app).post(ruta).send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/invalid/i);
  });

  test('el cron de recordatorios sigue procesando deudas aunque falle un envio externo', async () => {
    prisma.deuda.findMany.mockResolvedValueOnce([
      {
        id: 1,
        importe: 25,
        deudor: { expo_push_token: 'ExponentPushToken[uno]' },
        acreedor: { id: 10, nombre: 'Ada', apellidos: 'Lovelace' },
      },
      {
        id: 2,
        importe: 10.5,
        deudor: { expo_push_token: 'ExponentPushToken[dos]' },
        acreedor: { id: 11, nombre: 'Grace', apellidos: null },
      },
    ]);
    enviarNotificacion.mockRejectedValueOnce(new Error('expo caido'));
    enviarNotificacion.mockResolvedValueOnce(undefined);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await enviarRecordatoriosMorosos();

    assert.equal(enviarNotificacion.mock.calls.length, 2);
    assert.equal(enviarNotificacion.mock.calls[0][0], 'ExponentPushToken[uno]');
    assert.equal(enviarNotificacion.mock.calls[1][0], 'ExponentPushToken[dos]');
    consoleError.mockRestore();
  });
});
