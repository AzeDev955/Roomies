# Issue #189 — Flujo Completo de Nuevo Gasto y Fetch

**Fecha:** 2026-04-09
**Épica:** 10 — Motor de Gastos y Balances

## Qué se hizo

### Backend
- Añadido handler `listarGastos` en `backend/src/controllers/gasto.controller.ts`:
  - Verifica que el usuario pertenece a la vivienda (habitación asignada)
  - Devuelve gastos ordenados por `fecha_creacion` DESC
  - Include de `pagador` (id, nombre, apellidos) y `deudas` para cálculo de balance en frontend
- Registrada ruta `GET /:viviendaId/gastos` en `backend/src/routes/gasto.routes.ts`, protegida por `verificarToken`

### Frontend
- Reescrita `frontend/app/inquilino/(tabs)/gastos.tsx`:
  - Obtención de `viviendaId` y `miId` desde `/inquilino/vivienda` (patrón idéntico al del Tablón)
  - Fetch real a `GET /viviendas/:viviendaId/gastos` con `useFocusEffect`
  - Cálculo de balance neto (deudas PENDIENTE acreedor − deudor) con hero card soft tint dinámico
  - Feed de movimientos con `AvatarInitials` del pagador, concepto, fecha localizada e importe
  - Empty state con icono `wallet-outline` y texto motivador (patrón Issue #173)
  - Modal bottom sheet (patrón Tablón): handle pill, dos inputs con label visible y focus state, botones Cancelar / Guardar
  - `POST /viviendas/:viviendaId/gastos` al guardar: prepend optimista, cierre de modal, Toast de éxito
  - Validación de importe > 0 con Toast de error inline antes de llamar a la API
- Añadidos estilos del modal en `frontend/styles/inquilino/gastos.styles.ts`:
  - `modalOverlay`, `modalContainer`, `modalHandle`, `modalTitulo`
  - `inputLabel`, `input` con focus state primario
  - `botonCancelar`, `botonGuardar`, `botonGuardarDisabled`, `botonPressed`, `modalAcciones`
