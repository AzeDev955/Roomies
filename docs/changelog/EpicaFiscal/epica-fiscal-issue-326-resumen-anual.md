# Epica Fiscal - Issue 326 - Resumen fiscal anual

Se expone el resumen fiscal anual del propietario por vivienda y ejercicio mediante `GET /api/viviendas/:viviendaId/fiscal/:ejercicio`.

## Cambios principales

- Se amplia el servicio fiscal con `construirResumenFiscalAnual`, que consolida ingresos desde `Deuda` y gastos potencialmente deducibles desde `Gasto`.
- El endpoint queda protegido para casero propietario: los inquilinos reciben `403` y las viviendas ajenas no exponen datos.
- Los importes se agregan en centimos y se devuelven normalizados a euros para evitar descuadres acumulados.
- La respuesta incluye totales por estado de cobro, tipo de ingreso, categoria fiscal, factura disponible y deducibilidad prevista.
- Las lineas incompletas se conservan con advertencias (`FALTA_FACTURA`, `FALTA_CATEGORIA`, `IMPORTE_PENDIENTE`, `PERIODO_INCOMPLETO`, `PRORRATEO_MANUAL`) en lugar de romper el resumen.
- Se documenta el contrato del nuevo endpoint en `docs/backend/api.md`.

## Verificacion

- Tests unitarios de servicio para totales, categorias, pendientes, advertencias y redondeo monetario.
- Tests de controller para permisos de inquilino, vivienda no perteneciente al casero y respuesta correcta del casero propietario.
