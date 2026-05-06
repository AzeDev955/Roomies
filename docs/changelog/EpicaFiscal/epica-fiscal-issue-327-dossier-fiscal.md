# Epica Fiscal - Issue 327 - Dossier fiscal para gestoria

Se anade la exportacion anual del dossier fiscal de una vivienda mediante `GET /api/viviendas/:viviendaId/fiscal/:ejercicio/dossier`.

## Cambios principales

- El servicio fiscal reutiliza el resumen anual existente y lo transforma en un CSV compatible con Excel.
- El dossier incluye una seccion `RESUMEN` con totales, vivienda, solicitante, fecha de generacion y contadores de revision.
- La seccion `DETALLE` mantiene columnas estables para ingresos y gastos, con referencias a facturas y justificantes como URL.
- Las lineas pendientes de cobro, sin factura, sin categoria, con periodo incompleto o prorrateo manual se marcan en la columna `Advertencias`.
- El endpoint soporta descarga directa `text/csv` y `formato=base64` para escritura movil.
- `docs/backend/api.md` documenta el contrato, columnas y respuestas.

## Verificacion

- Tests unitarios del servicio para secciones, columnas, nombre de archivo, advertencias y proteccion ante formula injection en CSV.
- Tests de controller para descarga CSV y respuesta base64.
