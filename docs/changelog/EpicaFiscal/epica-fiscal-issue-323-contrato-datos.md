# Epica Fiscal - Issue 323 - Contrato de datos fiscales del propietario

## Objetivo

Definir el contrato de datos que Roomies necesita para transformar actividad de alquiler, cobros, facturas y justificantes en un resumen fiscal revisable por el casero o gestor.

## Cambios

- Se anade `docs/backend/contrato-fiscal-propietario.md` con la auditoria de fuentes actuales (`Vivienda`, `Habitacion`, `Usuario`, `Gasto`, `GastoRecurrente`, `Deuda`, facturas y justificantes).
- Se define que los ingresos fiscales del propietario parten de `Deuda` con acreedor casero y tipos `ALQUILER_HABITACION`, `FACTURA_MENSUAL`, `CARGO_RECURRENTE` o `FACTURA_PUNTUAL`.
- Se separan importes emitidos, cobrados, pendientes y anulados para no mezclar caja real con facturacion emitida.
- Se documenta que los gastos sin factura o sin categoria fiscal futura quedan como pendientes de clasificacion.
- Se proponen DTOs internos para resumen fiscal por ejercicio, vivienda y linea fiscal sin implementar aun calculo ni UI compleja.

## Validacion

- Cambio documental revisado contra `backend/prisma/schema.prisma`, `backend/src/services/gasto.service.ts` y `backend/src/controllers/cobros.controller.ts`.

## Riesgos conocidos

- El modelo actual no conserva anulaciones ni borrados duros de facturas puntuales sin actividad; el contrato reserva el estado `ANULADO` para una futura persistencia explicita.
- No existe categoria fiscal persistida, por lo que la deducibilidad queda marcada como pendiente de clasificacion.
