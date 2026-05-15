process.env['DATABASE_URL'] ??= 'postgresql://postgres:postgres@localhost:5433/roomies_test';
process.env['GOOGLE_CLIENT_ID'] ??= 'google-client-test';
process.env['JWT_SECRET'] = 'jwt-secret-test-issue-247';
process.env['NODE_ENV'] = 'test';

import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { afterAll, beforeEach, test } from 'vitest';
import { login, register, actualizarRol } from '../src/controllers/auth.controller';
import { verificarToken } from '../src/middlewares/auth.middleware';
import { getJwtSecret } from '../src/config/env';
import { prisma } from '../src/lib/prisma';
import { RolUsuario } from '../src/generated/prisma/client';

const TEST_JWT_SECRET = 'jwt-secret-test-issue-247';

type MockResponse = {
  statusCode: number;
  body?: unknown;
  redirectUrl?: string;
  res: {
    status: (code: number) => MockResponse['res'];
    json: (payload: unknown) => MockResponse['res'];
    send: (payload: unknown) => MockResponse['res'];
    redirect: (url: string) => MockResponse['res'];
  };
};

function crearRespuesta(): MockResponse {
  const state: MockResponse = {
    statusCode: 200,
    res: {
      status(code: number) {
        state.statusCode = code;
        return state.res;
      },
      json(payload: unknown) {
        state.body = payload;
        return state.res;
      },
      send(payload: unknown) {
        state.body = payload;
        return state.res;
      },
      redirect(url: string) {
        state.redirectUrl = url;
        return state.res;
      },
    },
  };

  return state;
}

async function ejecutarHandler(handler: Function, req: Record<string, unknown>) {
  const response = crearRespuesta();
  let nextError: unknown;
  let nextCalled = false;
  const next = (error?: unknown) => {
    nextCalled = true;
    nextError = error;
  };

  await handler(req, response.res, next);

  return { ...response, nextCalled, nextError };
}

const originalUsuarioMethods = new Map<string, unknown>();
const mockedUsuarioMethods = new Set<string>();

function mockUsuario(methods: Record<string, unknown>) {
  const usuarioDelegate = prisma.usuario as unknown as Record<string, unknown>;

  for (const [name, implementation] of Object.entries(methods)) {
    if (!originalUsuarioMethods.has(name)) {
      originalUsuarioMethods.set(name, usuarioDelegate[name]);
    }

    mockedUsuarioMethods.add(name);
    usuarioDelegate[name] = implementation;
  }
}

beforeEach(() => {
  process.env['JWT_SECRET'] = TEST_JWT_SECRET;

  const usuarioDelegate = prisma.usuario as unknown as Record<string, unknown>;
  for (const name of mockedUsuarioMethods) {
    usuarioDelegate[name] = originalUsuarioMethods.get(name);
  }
  mockedUsuarioMethods.clear();
});

afterAll(async () => {
  await prisma.$disconnect();
});

function usuarioBase(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    nombre: 'Alicia',
    apellidos: 'Lopez',
    documento_identidad: '12345678Z',
    email: 'alicia@example.com',
    password_hash: 'hash',
    google_id: null,
    telefono: '600000000',
    rol: RolUsuario.CASERO,
    expo_push_token: null,
    correo_verificado: true,
    token_verificacion: 'token-secreto',
    ...overrides,
  };
}

function registroValido(overrides: Record<string, unknown> = {}) {
  return {
    nombre: 'Alicia',
    apellidos: 'Lopez',
    documento_identidad: '12345678Z',
    email: 'alicia@example.com',
    password: 'Password1',
    telefono: '600000000',
    rol: RolUsuario.CASERO,
    ...overrides,
  };
}

test('login correcto devuelve JWT y no filtra secretos del usuario', async () => {
  const password_hash = await bcrypt.hash('Password1', 4);
  mockUsuario({
    findUnique: async () => usuarioBase({ password_hash }),
  });

  const result = await ejecutarHandler(login, {
    body: { email: 'alicia@example.com', password: 'Password1' },
  });

  assert.equal(result.statusCode, 200);
  const body = result.body as { token: string; usuario: Record<string, unknown> };
  assert.equal(typeof body.token, 'string');
  assert.equal(body.usuario['password_hash'], undefined);
  assert.equal(body.usuario['token_verificacion'], undefined);

  const decoded = jwt.verify(body.token, TEST_JWT_SECRET) as { id: number; rol: string };
  assert.equal(decoded.id, 1);
  assert.equal(decoded.rol, RolUsuario.CASERO);
});

test('login incorrecto rechaza credenciales sin emitir token', async () => {
  const password_hash = await bcrypt.hash('Password1', 4);
  mockUsuario({
    findUnique: async () => usuarioBase({ password_hash }),
  });

  const result = await ejecutarHandler(login, {
    body: { email: 'alicia@example.com', password: 'OtraPassword1' },
  });

  assert.equal(result.statusCode, 401);
  assert.deepEqual(result.body, { error: 'Credenciales invalidas.' });
});

test('registro duplicado por email no crea usuario', async () => {
  let createCalled = false;
  mockUsuario({
    findFirst: async () => usuarioBase({ email: 'alicia@example.com' }),
    create: async () => {
      createCalled = true;
      return usuarioBase();
    },
  });

  const result = await ejecutarHandler(register, {
    body: registroValido({ email: 'alicia@example.com', documento_identidad: '87654321X' }),
  });

  assert.equal(result.statusCode, 400);
  assert.equal(createCalled, false);
});

test('registro duplicado por documento no crea usuario', async () => {
  let createCalled = false;
  mockUsuario({
    findFirst: async () => usuarioBase({ email: 'otra@example.com', documento_identidad: '12345678Z' }),
    create: async () => {
      createCalled = true;
      return usuarioBase();
    },
  });

  const result = await ejecutarHandler(register, {
    body: registroValido({ email: 'nueva@example.com', documento_identidad: '12345678Z' }),
  });

  assert.equal(result.statusCode, 400);
  assert.equal(createCalled, false);
});

test('middleware auth rechaza token ausente', async () => {
  const result = await ejecutarHandler(verificarToken, { headers: {} });

  assert.equal(result.statusCode, 401);
  assert.equal(result.nextCalled, false);
});

test('middleware auth rechaza token invalido', async () => {
  const result = await ejecutarHandler(verificarToken, {
    headers: { authorization: 'Bearer token-invalido' },
  });

  assert.equal(result.statusCode, 403);
  assert.equal(result.nextCalled, false);
});

test('middleware auth rechaza token expirado', async () => {
  const expiredToken = jwt.sign({ id: 1, rol: RolUsuario.CASERO }, TEST_JWT_SECRET, { expiresIn: '-1s' });

  const result = await ejecutarHandler(verificarToken, {
    headers: { authorization: `Bearer ${expiredToken}` },
  });

  assert.equal(result.statusCode, 403);
  assert.equal(result.nextCalled, false);
});

test('middleware auth acepta JWT valido y adjunta payload minimo', async () => {
  const token = jwt.sign({ id: 7, rol: RolUsuario.INQUILINO, password_hash: 'no-debe-usarse' }, TEST_JWT_SECRET, {
    expiresIn: '1h',
  });
  const req: Record<string, unknown> = { headers: { authorization: `Bearer ${token}` } };

  const result = await ejecutarHandler(verificarToken, req);

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, undefined);
  assert.deepEqual(req.usuario, { id: 7, rol: RolUsuario.INQUILINO });
});

test('cambio de rol rechaza valores invalidos sin tocar la base de datos', async () => {
  let updateCalled = false;
  mockUsuario({
    update: async () => {
      updateCalled = true;
      return usuarioBase();
    },
  });

  const result = await ejecutarHandler(actualizarRol, {
    usuario: { id: 1, rol: RolUsuario.INQUILINO },
    body: { rol: 'ADMIN' },
  });

  assert.equal(result.statusCode, 400);
  assert.equal(updateCalled, false);
});

test('JWT_SECRET ausente falla con error de configuracion claro', async () => {
  delete process.env['JWT_SECRET'];

  assert.throws(() => getJwtSecret(), /JWT_SECRET/);
});
