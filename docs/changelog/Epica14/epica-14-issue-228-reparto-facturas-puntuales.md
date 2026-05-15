# Issue #228 - Reparto igualitario y cuotas a 0 en facturas puntuales

**Fecha:** 2026-04-11
**Epica:** 14 - Facturacion flexible y precios privados

## Cambios tecnicos

- `frontend/app/casero/(tabs)/cobros.tsx`: el modal de factura puntual permite dejar vacios todos los importes para calcular un reparto igualitario automatico entre los participantes seleccionados.
- `frontend/app/casero/(tabs)/cobros.tsx`: se diferencia campo vacio de importe `0`, permitiendo que una persona seleccionada no pague esa factura sin bloquear el formulario.
- `frontend/app/casero/(tabs)/cobros.tsx`: el reparto se calcula en centimos para que los redondeos mantengan cuadrado el total, incluyendo casos como 100 EUR entre 3 personas.
- `frontend/app/casero/(tabs)/cobros.tsx`: se mantiene la validacion de importes negativos, importes invalidos, repartos manuales incompletos y sumas que no coinciden con el total.
- `frontend/styles/casero/cobros.styles.ts`: se anaden estilos para selector de participantes, estado no incluido y ayuda visual del contador de reparto usando tokens de `Theme`.
- `backend/src/controllers/gasto.controller.ts`: `repartoManual` acepta importes `0` y rechaza importes negativos o invalidos.
- `backend/src/services/gasto.service.ts`: el reparto automatico usa centimos y distribuye el resto entre participantes para que la suma de deudas coincida con el gasto.

## Validacion

- `backend`: `npm run build`.
- `frontend`: `npm run lint` sin errores; persisten warnings previos en pantallas no tocadas.
