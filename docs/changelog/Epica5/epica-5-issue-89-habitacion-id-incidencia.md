# Issue #89 — habitacion_id persistido en Incidencias

## Problema

El campo `habitacion_id` era recibido y validado por el backend al crear una incidencia, pero nunca se guardaba en la base de datos. El modelo `Incidencia` en Prisma no tenía la relación con `Habitacion`, por lo que el dato se perdía silenciosamente en cada llamada a `POST /incidencias`.

## Cambios

### Backend

**`backend/prisma/schema.prisma`**
- Añadida relación opcional `habitacion_id Int?` y `habitacion Habitacion?` en el modelo `Incidencia`.
- Añadida relación inversa `incidencias Incidencia[]` en el modelo `Habitacion`.
- Migración necesaria: `npx prisma migrate dev --name add-habitacion-id-to-incidencia`

**`backend/src/controllers/incidencia.controller.ts`**
- `prisma.incidencia.create` ahora incluye `habitacion_id` en `data` cuando viene en el body.

## Comportamiento resultante

El campo `habitacion_id` es opcional. Cuando el inquilino selecciona una habitación en la pantalla "Nueva incidencia", ese ID queda asociado al registro en la BD. Cuando no selecciona nada, `habitacion_id` es `null`.

La validación de seguridad (no reportar en dormitorio ajeno) ya existía y no se modifica.
