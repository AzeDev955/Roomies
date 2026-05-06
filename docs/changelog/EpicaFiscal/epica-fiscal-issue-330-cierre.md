# Epica Fiscal - Issue 330 - Documentacion, tests y cierre

## Objetivo

Cerrar la epica fiscal con documentacion de extremo a extremo, checklist manual, matriz de trazabilidad y riesgos legales/fiscales residuales.

## Cambios principales

- Se anade `docs/backend/fiscal-cierre-epica.md` como documento de cierre funcional y tecnico.
- Se documentan contrato de exportacion, columnas del dossier fiscal, permisos, minimizacion de datos y advertencias del CSV.
- Se documenta la pantalla fiscal de casero: ruta, visibilidad, estados, endpoints consumidos y flujo de revision/exportacion.
- Se incorpora checklist manual para vivienda realista con varios inquilinos, facturas con/sin adjunto, gastos sin clasificar, periodos parciales, prorrateo manual, export y errores de permisos.
- Se deja una matriz issue -> archivos principales -> tests -> estado para #323-#330, #337 y #338.
- Se actualizan `CONTEXT.md`, `README.md`, `docs/backend/api.md`, `docs/frontend/setup.md` y `docs/backend/contrato-fiscal-propietario.md` con enlaces y limites de cierre.

## Verificacion ejecutada

- `cd backend && npm test -- fiscal.service.test.ts fiscal.controller.test.ts contrato-issue-337.test.ts ocupacion-issue-338.test.ts`
- `cd frontend && npm test -- fiscal.test.tsx navigation-smoke.test.tsx`
- Checklist manual de `docs/backend/fiscal-cierre-epica.md`.

## Riesgos residuales

- Roomies no sustituye revision profesional de asesor fiscal ni normativa oficial actualizada.
- La firma interna no equivale a firma electronica avanzada o cualificada.
- Las URLs de documentos se entregan por endpoints protegidos, pero no son todavia un sistema de acceso documental privado con URL firmada/proxy.
