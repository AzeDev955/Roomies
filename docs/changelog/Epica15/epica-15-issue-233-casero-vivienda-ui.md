# Issue #233 - Correccion visual del casero dentro de vivienda

**Fecha:** 2026-04-11
**Epica:** 15 - Pulido de casero en vivienda y gastos comunes

## Cambios tecnicos

- `frontend/app/casero/vivienda/[id]/(tabs)/_layout.tsx`: el layout de tabs internas lee el `id` de vivienda con `useLocalSearchParams` para no reaccionar a parametros globales de rutas hermanas.
- `frontend/app/casero/vivienda/[id]/(tabs)/index.tsx`, `incidencias.tsx`, `limpieza.tsx`, `opciones.tsx` y `tablon.tsx`: aislamiento del parametro `id` en cada tab para evitar que perfiles, incidencias u otras pantallas con `[id]` mezclen estado con la vivienda abierta.
- `frontend/hooks/useViviendaIdParam.ts`: nuevo helper para obtener el `id` local de vivienda con fallback al pathname cuando Expo Router no propaga el parametro en tabs anidados.
- Se mantiene la navegacion interna de la vivienda separada de la navegacion global del casero, reduciendo solapes y renderizados inconsistentes al entrar o volver desde pantallas detalle.

## Validacion

- `frontend`: `npm run lint` sin errores; persisten warnings existentes del proyecto.
- `frontend`: `npx tsc --noEmit` sin errores.
