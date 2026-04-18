# Issue 315 - Opciones de vivienda del casero en modo oscuro

## Objetivo

Migrar el tab Opciones de vivienda y el gestor de modulos del casero al sistema de tema claro/oscuro de la epica de modo oscuro.

## Cambios

- `frontend/app/casero/vivienda/[id]/(tabs)/opciones.tsx` consume `useAppTheme()` y memoiza `createStyles(theme)` para respetar la preferencia manual o del sistema.
- `frontend/components/casero/vivienda/ModulosViviendaManager.tsx` sustituye colores estaticos por tokens del tema activo en iconos, switches y estados bloqueados.
- Se mantiene intacta la logica de activacion, actualizacion optimista, rollback y notificacion de modulos.

## Verificacion

- `npm run lint` (sin errores; mantiene warnings previos en `index.tsx` y `limpieza.tsx`).
