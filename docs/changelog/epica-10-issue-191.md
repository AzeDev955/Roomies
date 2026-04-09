# Issue #191 — Asignación específica de gastos

**Fecha:** 2026-04-09
**Épica:** 10

## Cambios técnicos

- `backend/src/controllers/gasto.controller.ts`: el endpoint `POST /viviendas/:viviendaId/gastos` ahora acepta `implicadosIds`, valida que sean IDs enteros de inquilinos activos de la vivienda y reparte el importe entre los implicados seleccionados o entre todos si no llega selección.
- `backend/src/controllers/gasto.controller.ts`: se mantiene la regla de no crear nunca una deuda del pagador consigo mismo, aunque su ID aparezca en `implicadosIds`.
- `frontend/app/inquilino/(tabs)/gastos.tsx`: el modal de nuevo gasto ahora carga y mantiene una selección de participantes, muestra pills horizontales con todos los inquilinos activos marcados por defecto y envía `implicadosIds` al guardar.
- `frontend/styles/inquilino/gastos.styles.ts`: se añadieron estilos del selector horizontal de participantes con pills soft-tint y estado visual seleccionado/no seleccionado siguiendo `Theme`.
- `frontend/app/inquilino/(tabs)/gastos.tsx`: validación manual revisada para impedir guardar un gasto sin participantes seleccionados y para resetear la selección al abrir/cerrar el modal.
