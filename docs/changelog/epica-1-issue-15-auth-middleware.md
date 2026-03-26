# Issue #15 — Middleware de autenticación JWT + GET /me

**Épica:** 1 — Setup inicial del proyecto
**Fecha:** 2026-03-27
**Rama:** `dev`

## Qué se hizo

- Regenerado cliente Prisma tras añadir `@unique` al campo `dni` del modelo `Usuario`.
- Creado `src/types/express/index.d.ts`: extiende `Express.Request` con `usuario?: { id, rol }` para que TypeScript acepte la inyección del payload JWT sin errores. No requiere cambios en `tsconfig.json` (cubierto por `"include": ["src/**/*"]`).
- Creado `src/middlewares/auth.middleware.ts` con la función `verificarToken`:
  - Extrae el token del header `Authorization: Bearer <token>`.
  - Sin token → 401 `Acceso denegado. Token no proporcionado.`
  - Token inválido/expirado → 403 `Token inválido o expirado.`
  - Token válido → inyecta `{ id, rol }` en `req.usuario` y llama `next()`.
- Añadida ruta `GET /api/auth/me` protegida con `verificarToken` que devuelve el payload del token.

## Rutas disponibles en /api/auth

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | — | Registro de nuevo usuario |
| POST | `/api/auth/login` | — | Login → devuelve JWT |
| GET | `/api/auth/me` | Bearer token | Devuelve payload del token activo |

## Notas

- `GET /me` devuelve el payload del JWT (`{ id, rol }`), no consulta la BD. Para obtener todos los datos del usuario habría que hacer un `findUnique` por `req.usuario.id`.
- `verificarToken` puede reutilizarse como middleware en cualquier ruta privada futura.
