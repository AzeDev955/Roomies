# Issue #216 — precio privado por habitacion habitable

**Fecha:** 2026-04-10
**Epica:** 13

## Cambios tecnicos

- `backend/prisma/schema.prisma`: anadido `Habitacion.precio Float?`.
- `backend/src/controllers/vivienda.controller.ts`: creacion y edicion de habitaciones aceptan `precio`, lo persisten solo para habitaciones habitables y lo limpian al marcar como no habitable.
- `backend/src/controllers/inquilino.controller.ts`: serializacion de habitaciones de `/inquilino/vivienda` fuerza `precio: null` para habitaciones ajenas.
- `frontend/app/casero/vivienda/[id]/nueva-habitacion.tsx`: input condicional de precio mensual para dormitorios habitables.
- `frontend/app/casero/vivienda/[id]/editar-habitacion.tsx`: edicion de precio mensual solo cuando la habitacion es habitable.
- `frontend/app/casero/vivienda/[id]/(tabs)/index.tsx`: visualizacion del precio privado en la tarjeta de habitacion del casero.
- `frontend/app/casero/nueva-vivienda.tsx`: alta inline de habitaciones con precio mensual opcional para habitaciones habitables.
- `frontend/app/inquilino/(tabs)/inicio.tsx`: visualizacion del precio de la habitacion propia y tolerancia a `precio: null` en companeros.

## Validacion

- `backend`: `npm run build`.
- `frontend`: `npm run lint` sin errores bloqueantes; quedan warnings preexistentes del proyecto.
