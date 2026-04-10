# Issue #197 — Dashboard de cobros para casero

**Fecha:** 2026-04-10
**Épica:** 12

## Cambios técnicos

- `backend/src/controllers/cobros.controller.ts`: creado el endpoint de resumen financiero del casero para una vivienda, filtrando deudas del mes actual donde el casero es acreedor y devolviendo totales pagado/pendiente junto al detalle de deudor, concepto y `justificante_url`.
- `backend/src/routes/gasto.routes.ts`: registrada la ruta `GET /:viviendaId/cobros` bajo `/api/viviendas` con autenticación.
- `frontend/app/casero/(tabs)/_layout.tsx`: añadida la nueva tab `Cobros` al dashboard del casero.
- `frontend/app/casero/(tabs)/cobros.tsx`: implementada la pantalla principal de cobros con selector de vivienda, hero card de resumen mensual, listas agrupadas por estado y modal de visualización del justificante.
- `frontend/styles/casero/cobros.styles.ts`: definidos estilos del dashboard con superficies blancas, `Theme.shadows.sm`, radios amplios, badges Soft Tint y modal de imagen.

## Resultado técnico observable

- El casero puede consultar por vivienda cuánto tiene ingresado y cuánto sigue pendiente en el mes actual desde un endpoint dedicado.
- La app muestra un dashboard visual de cobros con tarjetas por recibo y permite abrir el justificante subido por el inquilino sin salir de la pestaña.
