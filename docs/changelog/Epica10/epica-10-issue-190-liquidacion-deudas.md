# Issue #190 — Flujo de Liquidación de Deudas

**Fecha:** 2026-04-09
**Épica:** 10 — Motor de Gastos y Balances

## Qué se hizo

### Backend

- Añadido handler `listarDeudas` en `gasto.controller.ts`:
  - Verifica pertenencia a vivienda vía habitación asignada
  - Filtra deudas de la vivienda donde el usuario es deudor o acreedor
  - Include de `deudor`, `acreedor` (nombre, apellidos) y `gasto` (concepto)
- Añadido handler `saldarDeuda` en `gasto.controller.ts`:
  - Verifica pertenencia a vivienda
  - Verifica que la deuda pertenece a esa vivienda (via gasto.vivienda_id)
  - Solo el deudor puede saldar (403 si no es el deudor)
  - Responde 409 si ya está PAGADA
  - Actualiza estado a PAGADA
- Registradas rutas en `gasto.routes.ts`:
  - `GET /:viviendaId/deudas` → `listarDeudas`
  - `PATCH /:viviendaId/deudas/:deudaId/saldar` → `saldarDeuda`
  - `backend/src/controllers/gasto.controller.ts`: el endpoint `POST /viviendas/:viviendaId/gastos` ahora acepta `implicadosIds`, valida que sean IDs enteros de inquilinos activos de la vivienda y reparte el importe entre los implicados seleccionados o entre todos si no llega selección.
- `backend/src/controllers/gasto.controller.ts`: se mantiene la regla de no crear nunca una deuda del pagador consigo mismo, aunque su ID aparezca en `implicadosIds`.
- `frontend/app/inquilino/(tabs)/gastos.tsx`: el modal de nuevo gasto ahora carga y mantiene una selección de participantes, muestra pills horizontales con todos los inquilinos activos marcados por defecto y envía `implicadosIds` al guardar.
- `frontend/styles/inquilino/gastos.styles.ts`: se añadieron estilos del selector horizontal de participantes con pills soft-tint y estado visual seleccionado/no seleccionado siguiendo `Theme`.
- `frontend/app/inquilino/(tabs)/gastos.tsx`: validación manual revisada para impedir guardar un gasto sin participantes seleccionados y para resetear la selección al abrir/cerrar el modal.

### Frontend

- Reescrita `frontend/app/inquilino/(tabs)/gastos.tsx`:
  - Carga simultánea de gastos y deudas con `Promise.all` en `cargarTodo()`
  - Balance neto calculado desde el endpoint de deudas (más preciso)
  - Nueva sección "Deudas pendientes" entre la hero card y el feed de movimientos
  - **Tarjeta yo-debo**: soft tint rojo (`danger+'12'`), borde `danger+'30'`, botón "Saldar" con confirmación nativa Alert ("¿Has hecho ya el Bizum?")
  - **Tarjeta me-deben**: soft tint verde (`success+'12'`), borde `success+'30'`, badge "Esperando" sin acción
  - Al saldar: `PATCH` → recarga completa (`cargarTodo`) → Toast de éxito
  - Spinner inline en el botón "Saldar" mientras se procesa la petición
- Añadidos estilos en `gastos.styles.ts`:
  - `deudaCard`, `deudaInfo`, `deudaConcepto`, `deudaRelacion`, `deudaImporte`
  - `botonSaldar`, `botonSaldarPressed`, `botonSaldarTexto`
  - `badgeEsperando`, `badgeEsperandoTexto`
