# Feat: Códigos de invitación de un solo uso (burn after reading)

## Descripción

Al canjear un código de invitación, la habitación genera automáticamente un nuevo código. El código antiguo queda invalidado en el mismo `UPDATE`, evitando que un código interceptado pueda reutilizarse.

## Cambios

**`backend/src/controllers/inquilino.controller.ts`**

- Import de `generarCodigoInvitacion` añadido.
- En `unirseHabitacion`: antes del `prisma.habitacion.update`, se genera un `nuevoCodigo` con `generarCodigoInvitacion()` (garantiza unicidad con bucle de reintentos).
- El `update` asigna `inquilino_id` y `codigo_invitacion: nuevoCodigo` en la misma operación atómica.

## Comportamiento

1. Inquilino canjea `ROOM-ABC123`.
2. El backend asigna al inquilino **y** rota el código a `ROOM-XYZ789` en un solo `UPDATE`.
3. Cualquier intento posterior de usar `ROOM-ABC123` devuelve `404 — Código de invitación inválido`.
4. El casero puede copiar el nuevo código desde la pantalla de detalle de habitación para futuras asignaciones.

## Decisión técnica

La rotación se hace dentro del mismo `prisma.habitacion.update` para que sea atómica: no puede darse el caso de que el inquilino quede asignado pero el código no se haya rotado (o viceversa).
