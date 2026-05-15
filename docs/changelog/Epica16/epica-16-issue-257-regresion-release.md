# Issue #257 - Regresion final y checklist de release

## Objetivo

Cerrar la Epica 16 con una suite de regresion final, checklist manual de producto, matriz de trazabilidad por archivo e informe de riesgos residuales.

## Cambios

- `backend/tests/release-regression.test.ts`: nueva suite smoke de rutas principales protegidas, validacion de payloads publicos de auth y prueba de cron de recordatorios que no se detiene si falla un envio externo.
- `frontend/app/__tests__/navigation-smoke.test.tsx`: nueva suite smoke de tabs principales para casero, inquilino y detalle de vivienda, incluyendo ocultacion de modulos desactivados.
- `docs/release/epica-16-regresion-final.md`: checklist manual de release, matriz final archivo -> issue responsable -> estado, cobertura automatica por flujo y riesgos residuales.
- `docs/changelog/Epica16/epica-16-issue-257-regresion-release.md`: changelog del cierre de epica.

## Verificacion esperada

- `npm test` en `backend`.
- `npm run build` en `backend`.
- `npm test` en `frontend`.
- `npm run lint` en `frontend`.
- `docker compose config --quiet` desde la raiz.

Los resultados finales deben adjuntarse en la PR junto al checklist manual de `docs/release/epica-16-regresion-final.md`.
