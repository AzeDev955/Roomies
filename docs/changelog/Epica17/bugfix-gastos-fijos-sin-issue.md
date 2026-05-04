# Bugfix sin issue - Gastos fijos editables

## Objetivo

Permitir que el casero pueda cambiar y eliminar gastos fijos desde el resumen de vivienda, y limpiar el seed para no crear el alquiler mensual como mensualidad recurrente de ejemplo.

## Cambios

- `backend/src/controllers/gasto-recurrente.controller.ts`: añadidos handlers para actualizar y eliminar gastos recurrentes validando vivienda, propietario y payload.
- `backend/src/routes/gasto-recurrente.routes.ts`: expuestos `PATCH` y `DELETE` para `/api/viviendas/:viviendaId/gastos-recurrentes/:gastoRecurrenteId`.
- `frontend/app/casero/vivienda/[id]/(tabs)/index.tsx`: el modal de gasto fijo ahora sirve para crear y editar, y cada gasto activo muestra acciones de editar y eliminar.
- `backend/prisma/seed.ts`: eliminado el gasto recurrente de alquiler mensual del seed demo.
- `backend/tests/gasto-recurrente.test.ts` y `backend/tests/release-regression.test.ts`: cobertura de edición, eliminación y rutas protegidas.
- `docs/backend/api.md`, `docs/backend/setup.md`, `docs/frontend/setup.md` y `CONTEXT.md`: documentados los endpoints de edición/eliminación, el comportamiento frontend y el seed sin alquiler mensual demo.
