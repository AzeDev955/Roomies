# Epica Fiscal - Issue 324 - Metadatos fiscales en gastos

## Objetivo

Permitir que los gastos registrados por el casero conserven categoria fiscal y metadatos privados suficientes para el resumen anual, sin exponer esa informacion a inquilinos.

## Cambios

- Se anade `CategoriaFiscalGasto` y campos fiscales en `Gasto`: `categoria_fiscal`, `deducible_previsto`, `notas_fiscales` y `prorrateo_fiscal`.
- Los gastos existentes quedan compatibles mediante `categoria_fiscal = SIN_CLASIFICAR` por defecto.
- El backend permite crear y editar facturas del casero con metadatos fiscales validados.
- El listado de gastos de inquilino oculta los metadatos fiscales privados del propietario.
- El dashboard de cobros del casero incluye los nuevos campos en el detalle de cada gasto.

## Validacion

- Se amplian tests del modulo economico para defaults, validacion de metadatos, permisos y ocultacion a inquilinos.

## Riesgos conocidos

- La UI aun no incluye controles para editar estos campos; queda preparado el contrato backend.
