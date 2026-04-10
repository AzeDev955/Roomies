# Issue #90 — Ciclo de vida del inquilino: abandonar y expulsar

## Problema

No existía ningún mecanismo para desvincular a un inquilino de su habitación. El endpoint `DELETE /viviendas/:id/habitaciones/:habId` falla si la habitación tiene inquilino, lo que hacía imposible liberar una habitación sin intervención directa en la base de datos.

## Cambios

### Backend

**`backend/src/controllers/inquilino.controller.ts`**
- Nuevo handler `abandonarHabitacion` — el inquilino logueado se desvincula de su habitación actual.
  - 403 si el usuario es CASERO
  - 404 si el inquilino no tiene habitación asignada
  - 200 con mensaje de confirmación si todo va bien

**`backend/src/routes/inquilino.routes.ts`**
- Nueva ruta `DELETE /inquilino/habitacion` → `abandonarHabitacion`

**`backend/src/controllers/vivienda.controller.ts`**
- Nuevo handler `expulsarInquilino` — el casero desvincula al inquilino de una habitación específica de su vivienda.
  - 403 si la vivienda no pertenece al casero
  - 404 si la habitación no existe en esa vivienda
  - 400 si la habitación no tiene inquilino
  - 200 con mensaje de confirmación

**`backend/src/routes/vivienda.routes.ts`**
- Nueva ruta `DELETE /viviendas/:id/habitaciones/:habId/inquilino` → `expulsarInquilino`
- La ruta específica `/inquilino` se registra **antes** que `DELETE /:habId` para que Express no la interprete como un `habId` con valor `"inquilino"`

## Endpoints añadidos

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `DELETE` | `/inquilino/habitacion` | INQUILINO | El inquilino abandona su habitación |
| `DELETE` | `/viviendas/:id/habitaciones/:habId/inquilino` | CASERO | El casero expulsa al inquilino de una habitación |

## Comportamiento tras desvincular

- `inquilino_id` queda a `null` en la habitación
- El código de invitación se conserva (para que el casero pueda compartirlo con el siguiente inquilino)
- El inquilino vuelve al estado de onboarding en la app (pantalla de canjear código)
