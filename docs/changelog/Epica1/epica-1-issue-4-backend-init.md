# Issue #4 — Inicialización del Backend y Base de Datos

**Épica:** 1 — Setup inicial del proyecto
**Fecha:** 2026-03-26
**Rama:** `dev`

## Qué se hizo

- Inicializado proyecto Node.js con `npm init` en carpeta `backend/`.
- Instaladas dependencias de producción: `express`, `cors`, `dotenv`.
- Instaladas dependencias de desarrollo: `typescript`, `@types/node`, `@types/express`, `ts-node`, `nodemon`, `prisma`.
- Generado `tsconfig.json` con target ES2020, módulo CommonJS y `strict: true`.
- Inicializado Prisma ORM v7 (`npx prisma init`) con proveedor PostgreSQL.
- Definido el esquema de base de datos en `backend/prisma/schema.prisma`:
  - Enums: `RolUsuario` (CASERO, INQUILINO), `EstadoIncidencia` (PENDIENTE, EN_PROCESO, RESUELTA).
  - Modelos: `Usuario`, `Vivienda`, `Habitacion` (inquilino_id opcional), `Incidencia` (estado default PENDIENTE, fecha_creacion default now).
- Creado servidor Express básico en `backend/src/index.ts` con endpoint `GET /ping → pong` en puerto 3000.

## Notas

- No se han ejecutado migraciones. Pendiente configurar `DATABASE_URL` en `backend/.env` antes de `npx prisma migrate dev`.
- Prisma 7 usa `prisma.config.ts` para la conexión a BD (en lugar de `url = env(...)` directamente en el schema).
