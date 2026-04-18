# Issue 305 - Nueva incidencia del casero en modo oscuro

## Objetivo

Migrar la pantalla de nueva incidencia del casero al sistema de tema claro/oscuro de la epica de modo oscuro.

## Cambios

- `frontend/app/casero/vivienda/[id]/nueva-incidencia.tsx` consume `useAppTheme()` y memoiza `createStyles(theme)` para respetar la preferencia manual o del sistema.
- `frontend/styles/casero/vivienda/nueva-incidencia.styles.ts` pasa a aceptar `AppTheme` y sustituye colores estaticos por tokens dinamicos en formulario, pills de ubicacion, selector de prioridad, errores y estado de envio.
- Los colores semanticos de prioridad se exponen como helpers dependientes del tema para mantener los soft tints en claro y oscuro.

## Verificacion

- `npm run lint` (sin errores; mantiene warnings previos en tabs de vivienda y limpieza).
- `npx tsc --noEmit`
