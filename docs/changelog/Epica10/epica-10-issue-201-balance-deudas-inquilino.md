# Issue #201 — Balance separado de deudas del inquilino

**Fecha:** 2026-04-10
**Épica:** 10 — Gastos compartidos y balances

## Cambios técnicos

- `frontend/app/inquilino/(tabs)/gastos.tsx`: se eliminó el balance neto acumulado y se separaron las deudas del inquilino en tres grupos: deudas relacionadas conmigo, pendientes entre compañeros y pendientes con el casero.
- `frontend/app/inquilino/(tabs)/gastos.tsx`: el resumen superior ahora muestra dos métricas independientes, `debes` y `te deben`, evitando compensar importes entre personas distintas.
- `frontend/app/inquilino/(tabs)/gastos.tsx`: las listas de pendientes ahora filtran solo deudas donde participa el inquilino logueado para no mostrar movimientos ajenos como si fueran suyos.
- `frontend/app/inquilino/(tabs)/gastos.tsx`: se añadió un bloque específico para la relación con el casero, separado del balance entre compañeros.
- `frontend/styles/inquilino/gastos.styles.ts`: se añadieron estilos para el nuevo resumen doble del hero y para la tarjeta independiente de deuda con casero siguiendo los tokens de `Theme`.
- `frontend/package.json`: validación ejecutada con `npm run lint`; no aparecieron errores nuevos y solo quedaron warnings previos en otros archivos del proyecto.

## Suposición usada

- Se toma `Issue #201` por el nombre de la rama `feat/201-separar-deudas-inquilino-casero`.
