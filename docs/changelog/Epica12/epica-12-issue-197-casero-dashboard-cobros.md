# Issue #197 - Dashboard de cobros para casero

**Fecha:** 2026-04-10
**Epica:** 12

## Cambios tecnicos

- `frontend/app/casero/(tabs)/_layout.tsx`: se mantiene la tab `Cobros` como punto de entrada del dashboard financiero del casero.
- `frontend/app/casero/(tabs)/cobros.tsx`: se revierte la carga de mensualidades para que el dashboard global de cobros vuelva a limitarse al resumen financiero y no dependa de un contexto de vivienda abierto.
- `frontend/app/casero/vivienda/[id]/(tabs)/index.tsx`: la gestion de gastos fijos se mueve al resumen de cada vivienda, donde ya existe el `id` de la casa en ruta y se puede listar y crear mensualidades dentro del contexto correcto.
- `frontend/styles/casero/vivienda/detalle.styles.ts`: se anaden estilos para la seccion de mensualidades, el estado vacio, el CTA secundario y el modal de alta dentro del detalle de vivienda.
- `frontend/styles/casero/cobros.styles.ts`: se eliminan los estilos de mensualidades que ya no pertenecen al dashboard global.

## Resultado tecnico observable

- El casero gestiona los gastos fijos dentro de cada vivienda, evitando errores de permisos por intentar operar fuera del contexto de la casa.
- La UI mantiene el copy natural y amigable: la lista explica que Roomies divide automaticamente los recibos y el modal informa de la generacion nocturna y la notificacion a inquilinos sin mencionar detalles internos.
