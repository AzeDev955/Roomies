# Epica 17 - Issue 283 - Limpieza por habitaciones

## Objetivo

Reorientar el módulo de limpieza para que los turnos y asignaciones se apoyen en habitaciones responsables y en espacios objetivo, en lugar de depender directamente de inquilinos como entidad principal.

## Cambios principales

- `backend/prisma/schema.prisma`: `ZonaLimpieza` puede vincularse a una habitación objetivo; `AsignacionLimpiezaFija` y `TurnoLimpieza` pasan a guardar habitación responsable y mantienen `usuario_id` como snapshot opcional del ocupante al generar el turno.
- `backend/src/services/limpieza.service.ts`: el reparto semanal rota por habitaciones habitables ocupadas, conserva balances por ocupante activo y sigue permitiendo zonas con asignación fija.
- `backend/src/controllers/limpieza.controller.ts`: las respuestas de zonas y turnos exponen tipo de espacio, habitación responsable y responsable actual derivado; los permisos del inquilino se limitan a su habitación y a zonas comunes/espacios visibles.
- `frontend/app/casero/vivienda/[id]/(tabs)/limpieza.tsx`: el casero configura espacios de limpieza vinculados a habitación o personalizados y asigna responsables fijas por habitación.
- `frontend/app/inquilino/(tabs)/limpieza.tsx`: el inquilino ve sus tareas según su habitación responsable y solo el contexto relacionado del resto de la vivienda.
- `backend/tests/limpieza.service.test.ts` y `backend/tests/operational-modules.test.ts`: se actualizan al nuevo contrato de habitaciones responsables y a la exportación enriquecida.

## Verificacion

- `npx prisma validate --schema prisma/schema.prisma`
- `npm run build` en `backend/`
- `npm test -- limpieza.service.test.ts operational-modules.test.ts` en `backend/`
- `npm run lint` en `frontend/` (mantiene únicamente warnings previos ajenos en `frontend/app/casero/vivienda/[id]/(tabs)/index.tsx`)
