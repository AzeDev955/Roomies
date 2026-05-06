# Epica Fiscal - Issue 325 - Ocupacion y prorrateos por vivienda

## Objetivo

Preparar el backend para devolver una foto anual de ocupacion por vivienda y habitacion, incluyendo periodos parciales, cambios de inquilino y prorrateos revisables.

## Cambios

- Se anade un servicio fiscal testable que calcula dias alquilados, meses equivalentes, porcentaje de ocupacion y estado (`SIN_ACTIVIDAD`, `PARCIAL`, `TODO_EL_ANO`) por vivienda y habitacion.
- La ocupacion anual se apoya en cargos `ALQUILER_HABITACION` con `periodo_facturacion` mensual, preservando el inquilino asociado al cargo cuando existe.
- Se marcan revisiones manuales cuando faltan periodos de facturacion, existe ocupacion actual sin cargos del ejercicio o una habitacion con actividad no conserva precio valido.
- Se calculan prorrateos de gastos por porcentaje manual (`prorrateo_fiscal`) o, si no existe, por porcentaje anual de ocupacion de la vivienda.
- Se expone `GET /api/viviendas/:viviendaId/fiscal/ocupacion?ejercicio=YYYY` para caseros propietarios.
- Se documenta el endpoint en `docs/backend/api.md`.

## Validacion

- Se anaden tests unitarios para cambio de inquilino, habitaciones vacias, periodos parciales y prorrateos manuales/por ocupacion.

## Riesgos conocidos

- El modelo actual no guarda historico explicito de altas y bajas de contrato; cuando faltan cargos mensuales suficientes, el backend marca revision manual en vez de inferir fechas.
