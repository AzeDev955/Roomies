# Issue #188 — Dashboard de Gastos Comunes

**Fecha:** 2026-04-09
**Épica:** 10 — Motor de Gastos y Balances

## Qué se hizo

- Creada pantalla `frontend/app/inquilino/(tabs)/gastos.tsx` con:
  - Carga de vivienda e id del usuario autenticado vía `/inquilino/vivienda`
  - Petición a `GET /viviendas/:viviendaId/gastos` para el historial de movimientos
  - Cálculo de balance neto (deudas_a_cobrar − deudas_a_pagar, solo PENDIENTE)
  - **Hero Card**: soft tint rojo (`danger+'15'`) si el balance es negativo, soft tint verde (`success+'15'`) si es positivo; importe en tipografía hero (32pt, peso 900)
  - **Feed de movimientos**: lista de cards con `AvatarInitials` del pagador, concepto, fecha localizada y importe total
  - **Empty State**: patrón Issue #173 — caja soft tint primary, icono `wallet-outline`, título y subtítulo motivador
  - **FAB**: botón `+` flotante (esquina inferior derecha) con sombra coloreada; muestra `Alert` placeholder hasta Issue #189
- Creado `frontend/styles/inquilino/gastos.styles.ts` con todos los estilos usando exclusivamente tokens de `Theme.ts`
- Registrada la pestaña `gastos` en `frontend/app/inquilino/(tabs)/_layout.tsx` con icono `wallet-outline` y título "Gastos", posicionada antes de "Perfil"
