# Issue 306 - Detalle de incidencia en modo oscuro

## Objetivo

Migrar el detalle compartido de incidencia al sistema de tema claro/oscuro de la epica de modo oscuro.

## Cambios

- `frontend/app/incidencia/[id].tsx` consume `useAppTheme()` y memoiza `createStyles(theme)` para respetar la preferencia manual o del sistema.
- `frontend/styles/incidencia/detalle.styles.ts` pasa a aceptar `AppTheme` y sustituye los mapas de color estaticos por helpers dependientes del tema.
- Los badges de prioridad, estados, inputs de edicion, botones y estados de carga usan tokens dinamicos de la paleta activa.

## Verificacion

- `npm test -- app/incidencia/__tests__/detalle.test.tsx --runInBand`
