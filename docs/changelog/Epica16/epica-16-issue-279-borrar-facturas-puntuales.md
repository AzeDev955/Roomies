# Epica 16 - Issue 279 - Borrar facturas puntuales sin pagos asociados

## Objetivo

Permitir al casero eliminar facturas puntuales creadas por error antes de que entren en flujo de pago, sin tocar facturas mensuales ni recibos que ya tengan actividad asociada.

## Cambios

- `backend/src/controllers/gasto.controller.ts`: añade el borrado seguro de facturas puntuales y bloquea la acción si existe cualquier pago registrado o justificante asociado.
- `backend/src/routes/gasto.routes.ts`: registra `DELETE /api/viviendas/:viviendaId/gastos/:gastoId` protegido por token y modulo de gastos.
- `backend/tests/economico.test.ts`: cubre borrado permitido, bloqueo por justificante y bloqueo para tipos de factura no incluidos en el alcance.
- `frontend/app/casero/(tabs)/cobros.tsx`: incorpora confirmacion nativa, accion de eliminar dentro del modal de edicion y actualizacion inmediata del dashboard tras el borrado.
- `frontend/styles/casero/cobros.styles.ts`: anade una nota destructiva suave para explicar cuando una factura puntual abierta puede borrarse.
- `docs/backend/api.md`: documenta el endpoint y sus reglas de acceso.

## Validacion

- `npm test` en `backend`.
