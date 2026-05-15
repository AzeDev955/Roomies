# Issue #227 — modulos de vivienda desde opciones

**Fecha:** 2026-04-11
**Epica:** 13

## Cambios tecnicos

- `frontend/app/casero/vivienda/[id]/(tabs)/opciones.tsx`: creado el nuevo tab `Opciones` de la vivienda para centralizar la gestion de modulos en el lugar natural de configuracion de la casa.
- `frontend/components/casero/vivienda/ModulosViviendaManager.tsx`: extraida la UI de switches de modulos a un componente reutilizable que actualiza `mod_limpieza`, `mod_gastos` y `mod_inventario` mediante `PATCH /viviendas/:id`.
- `frontend/utils/viviendaModules.ts`: anadido un canal local de notificacion para propagar cambios de modulos por `viviendaId` sin requerir recargar la app ni salir de la navegacion actual.
- `frontend/app/casero/vivienda/[id]/(tabs)/_layout.tsx`: incorporado el tab `Opciones` y suscripcion a cambios de modulos para ocultar o mostrar `Limpieza` automaticamente segun la vivienda abierta.
- `frontend/app/casero/vivienda/[id]/(tabs)/index.tsx`: retirada la seccion de configuracion de modulos del resumen para evitar duplicidad y dejar la gestion dentro de opciones.
- `frontend/app/casero/(tabs)/_layout.tsx`: refresco automatico de tabs globales de casero cuando cambian los modulos de una vivienda.
- `frontend/app/casero/(tabs)/cobros.tsx`: filtrado de viviendas para que el dashboard solo pueda seleccionar casas con `mod_gastos` activo y no intente cargar cobros de viviendas donde el modulo esta desactivado.
- `frontend/app/casero/(tabs)/inventario.tsx`: filtrado de viviendas para que inventario solo trabaje con casas con `mod_inventario` activo y evite estados inconsistentes tras desactivar el modulo.

## Bugfix posterior

- `frontend/app/casero/vivienda/[id]/(tabs)/_layout.tsx`: lectura de `id` con `useGlobalSearchParams` para conservar el parametro de la ruta dinamica dentro de tabs anidados.
- `frontend/app/casero/vivienda/[id]/(tabs)/opciones.tsx`: evitadas llamadas a `/viviendas/undefined` al cargar la configuracion de modulos.
- `frontend/app/casero/vivienda/[id]/(tabs)/limpieza.tsx`: evitadas llamadas a endpoints de zonas, turnos y asignaciones cuando el `id` de vivienda aun no esta disponible.
- `frontend/app/casero/vivienda/[id]/(tabs)/index.tsx`, `incidencias.tsx` y `tablon.tsx`: normalizada la lectura del `id` de vivienda en todos los tabs hermanos para mantener el mismo comportamiento de navegacion.

## Validacion

- `frontend`: `npm run lint` sin errores bloqueantes; quedan warnings preexistentes del proyecto.
- `frontend`: `npx tsc --noEmit` sin errores.
