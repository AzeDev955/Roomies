# Issue 297 - Nueva vivienda en modo oscuro

## Objetivo

Migrar el formulario de nueva vivienda del casero al sistema de tema claro/oscuro de la epica de modo oscuro.

## Cambios

- `frontend/app/casero/nueva-vivienda.tsx` consume `useAppTheme()` y memoiza `createStyles(theme)` para reaccionar a la preferencia manual o del sistema.
- `frontend/styles/casero/nueva-vivienda.styles.ts` sustituye tokens estaticos por `AppTheme`, cubriendo fondos, textos, bordes, sombras, inputs, switches, pills, botones y estados de carga.
- Los tints de seleccion y acciones destructivas pasan a usar tokens semanticos adaptados a claro/oscuro.

## Verificacion

- `npm run lint`
- `npx tsc --noEmit`
