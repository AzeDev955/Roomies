# Issue #271 - Editar facturas mensuales

## Cambios

- `backend/prisma/schema.prisma`: `Gasto` registra `fecha_modificacion` y el usuario `modificado_por` que edito la factura.
- `backend/src/controllers/gasto.controller.ts`: una factura con cobros pagados queda bloqueada para cambios de concepto, importe, fecha o adjunto; las facturas abiertas actualizan las deudas pendientes cuando cambia el importe.
- `backend/src/controllers/cobros.controller.ts`: el dashboard de cobros expone la trazabilidad de la ultima modificacion.
- `frontend/app/casero/(tabs)/cobros.tsx`: el casero puede editar concepto, importe, fecha y adjunto de facturas abiertas, ve cuando se modificaron y recibe feedback cuando una factura esta bloqueada.

## Validacion

- `npm test` en `backend`.
- `npm run build` en `backend`.
- `npm run lint` en `frontend`.
