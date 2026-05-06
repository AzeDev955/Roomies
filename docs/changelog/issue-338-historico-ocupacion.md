# Issue 338 - Historico explicito de ocupacion

## Objetivo

Persistir periodos historicos de ocupacion por vivienda, habitacion e inquilino para que el modo fiscal no dependa solo de cargos mensuales de alquiler.

## Cambios principales

- Nuevo modelo `PeriodoOcupacion` con fechas de inicio/fin, estado, origen, renta mensual, contrato asociado opcional y marca `requiere_revision`.
- Nuevos enums `EstadoPeriodoOcupacion` y `OrigenPeriodoOcupacion` (`CONTRATO_FIRMADO`, `ALTA_MANUAL`, `INFERIDO_CARGO_ALQUILER`, `MIGRADO`).
- El flujo de unirse a una habitacion abre un periodo de ocupacion; abandonar o expulsar cierra el periodo activo.
- La firma de un contrato alimenta el historico con origen `CONTRATO_FIRMADO`, dejando una API interna reutilizable por el flujo de contratos.
- La foto fiscal de ocupacion usa `PeriodoOcupacion` como fuente preferente, con contratos firmados y cargos de alquiler como respaldo heredado.
- Se anade utilidad para inferir tramos desde cargos `ALQUILER_HABITACION` y marcarlos como revisables.

## Documentacion

- `docs/backend/api.md`
- `docs/backend/contrato-fiscal-propietario.md`

## Verificacion

- `npm test -- ocupacion-issue-338.test.ts contrato-issue-337.test.ts fiscal.service.test.ts multitenant-security.test.ts`
