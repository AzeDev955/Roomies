# Issue #6 — Endpoint POST /auth/register

**Épica:** 1 — Setup inicial del proyecto
**Fecha:** 2026-03-26
**Rama:** `dev`

## Qué se hizo

- Instalada librería `bcrypt` para hasheo de contraseñas (10 salt rounds).
- Ejecutado `npx prisma generate` para generar el cliente Prisma en `src/generated/prisma/`.
- Creado `src/lib/prisma.ts`: singleton `PrismaClient` con patrón global para evitar múltiples conexiones durante hot-reload con nodemon.
- Creado `src/controllers/auth.controller.ts` con la función `register`:
  - Comprueba si ya existe un usuario con el mismo email o DNI → 400 si existe.
  - Hashea la contraseña con bcrypt (10 rounds).
  - Crea el usuario en BD y devuelve 201 con los datos sin `password_hash`.
- Creado `src/routes/auth.routes.ts` con la ruta `POST /register`.
- Actualizado `src/index.ts` para montar las rutas de auth en `/api/auth` y añadir `dotenv/config`.

## Endpoint disponible

```
POST /api/auth/register
Content-Type: application/json

{
  "nombre": "string",
  "apellidos": "string",
  "dni": "string",
  "email": "string",
  "password": "string",
  "telefono": "string",
  "rol": "CASERO | INQUILINO"
}
```

**Respuestas:**
- `201 Created` — usuario creado (sin `password_hash`)
- `400 Bad Request` — email o DNI ya registrado

## Notas

- `dni` no tiene `@unique` en el schema, por lo que la unicidad se valida con `findFirst` antes del insert.
- No implementado Login ni JWT (pendiente issue #7 o similar).
