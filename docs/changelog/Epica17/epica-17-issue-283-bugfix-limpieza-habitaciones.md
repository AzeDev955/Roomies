# Epica 17 - Issue 283 - Bugfix limpieza por habitaciones

## Objetivo

Corregir regresiones del modulo de limpieza tras orientarlo a habitaciones responsables en lugar de inquilinos.

## Cambios principales

- `backend/src/services/limpieza.service.ts`: las asignaciones fijas a habitaciones habitables generan turno aunque la habitacion este vacia, conservando `usuario_id` como snapshot nulo.
- `backend/src/services/limpieza.service.ts`: los balances solo consideran el peso de turnos con responsable actual, evitando que una habitacion vacia altere la cuota de inquilinos activos.
- `backend/src/controllers/limpieza.controller.ts`: el endpoint de asignaciones fijas deduplica habitaciones y el borrado legacy elimina todas las asignaciones de la zona.
- `frontend/app/casero/vivienda/[id]/(tabs)/limpieza.tsx` y `frontend/app/inquilino/(tabs)/limpieza.tsx`: las pantallas toleran turnos o asignaciones con relacion `habitacion` parcial y usan `habitacion_id` como fallback para evitar crashes al leer `inquilino`.
- `backend/tests/limpieza.service.test.ts`: se cubren habitaciones vacias con asignacion fija y semanas sin ocupantes cuando solo hay tareas fijas.

## Verificacion

- `npm test -- limpieza.service.test.ts operational-modules.test.ts` en `backend/`
- `npm run build` en `backend/`
- `npm run lint` en `frontend/`
