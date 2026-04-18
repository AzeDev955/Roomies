# Issue 302 - Tablon de vivienda del casero en modo oscuro

## Objetivo

Migrar el tab Tablon de vivienda del casero al sistema de tema claro/oscuro de la epica de modo oscuro.

## Cambios

- `frontend/app/casero/vivienda/[id]/(tabs)/tablon.tsx` consume `useAppTheme()` y memoiza `createStyles(theme)` para respetar la preferencia manual o del sistema.
- `frontend/styles/tablon/tablon.styles.ts` pasa a aceptar `AppTheme` y sustituye colores estaticos por tokens dinamicos en lista, tarjetas, FAB, modal, inputs y estado vacio.
- Los tablones compartidos de inquilino y ruta explicita reutilizan el mismo stylesheet dinamico para evitar regresiones por estilos compartidos.

## Verificacion

- `npm run lint` (sin errores; mantiene warnings previos en `index.tsx` y `limpieza.tsx`).
- `npx tsc --noEmit`
