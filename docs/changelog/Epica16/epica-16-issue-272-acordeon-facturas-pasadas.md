# Epica 16 - Issue 272 - Acordeon para facturas pasadas

## Objetivo
Ordenar el listado acumulativo de facturas emitidas para que las facturas actuales o con cobros pendientes sigan visibles y el historico cerrado quede agrupado por mes.

## Cambios
- Se anade `AccordionSection` como componente comun reutilizable para listados acumulativos plegables.
- El dashboard de cobros del casero prioriza facturas del mes actual o con deudas pendientes.
- Las facturas pasadas con todas sus deudas pagadas se agrupan por mes y ano en acordeones plegados por defecto.
- El acordeon expone estado accesible expandido/colapsado y conserva labels tactiles claros.
- Se anaden tests del comportamiento de plegado y accesibilidad basica del acordeon.

## Verificacion
- `frontend`: `npm test -- --runInBand`.
- `frontend`: `npm run lint` sin errores; persisten warnings previos en pantallas no tocadas.
