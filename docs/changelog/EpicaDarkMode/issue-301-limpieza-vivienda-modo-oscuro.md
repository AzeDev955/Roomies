# Issue 301 - Limpieza de vivienda en modo oscuro

## Objetivo

Migrar el tab Limpieza de vivienda del casero al sistema de tema claro/oscuro de la epica de modo oscuro.

## Cambios

- `frontend/app/casero/vivienda/[id]/(tabs)/limpieza.tsx` consume `useAppTheme()` y memoiza `createStyles(theme)` para reaccionar a la preferencia manual o del sistema.
- `frontend/styles/casero/vivienda/limpieza.styles.ts` sustituye los tokens estaticos por `AppTheme`, cubriendo fondos, textos, bordes, sombras, modales, filtros, turnos y estados vacios.
- Los indicadores, avatares, acciones de exportacion y estados de carga usan colores del tema activo.

## Verificacion

- `npm run lint`
- `npx tsc --noEmit`
