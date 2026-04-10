# Issue #sin-numero — Sincronizacion documental de cobros, push y mensualidades

**Fecha:** 2026-04-10
**Epica:** 12

## Cambios tecnicos

- `CONTEXT.md`: actualizado el contexto general con stack de Cloudinary/push, resumen funcional de la epica 12, modelos `Gasto`, `GastoRecurrente` y `Deuda`, y endpoints clave de finanzas y push.
- `docs/backend/api.md`: documentados los endpoints `gastos`, `deudas`, `gastos-recurrentes`, `cobros`, `POST /deudas/:deudaId/justificante` y `PATCH /usuarios/me/push-token`, incluyendo reglas de acceso y notas de cron.
- `docs/backend/setup.md`: reescrita la guia de despliegue/configuracion para reflejar Cloudinary en inventario y justificantes, los cron de mensualidades/recordatorios y el registro del `expo_push_token`.
- `docs/frontend/setup.md`: reescrita la guia del frontend con la estructura real de tabs del casero e inquilino, el flujo de cobros/gastos de la epica 12 y la sincronizacion de notificaciones push.
- `README.md`: limpiado el contenido conflictivo y actualizado el resumen del producto para incluir cobros, mensualidades recurrentes y recordatorios push.
- `frontend/app/casero/vivienda/[id]/(tabs)/limpieza.tsx`: sustituido `useGlobalSearchParams` por `useLocalSearchParams` para fijar el `id` de la vivienda y evitar recargas con ids de otras rutas abiertas.
- `frontend/app/casero/vivienda/[id]/(tabs)/incidencias.tsx`: sustituido `useGlobalSearchParams` por `useLocalSearchParams` para mantener el contexto local de la vivienda dentro de la tab anidada.
- `frontend/app/casero/vivienda/[id]/(tabs)/tablon.tsx`: sustituido `useGlobalSearchParams` por `useLocalSearchParams` para evitar colisiones del parametro `id` al navegar a pantallas como el perfil de inquilino.

## Resultado tecnico observable

- La documentacion del repo vuelve a describir el comportamiento real de la epica 12 en contexto general, referencia API, setup backend, setup frontend y README.
- Al entrar en `/casero/inquilino/[id]` desde el detalle de una vivienda, las tabs anidadas del casero ya no intentan recargar datos de limpieza, incidencias o tablon con el id del inquilino.
