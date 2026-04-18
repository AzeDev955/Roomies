# Issue 300 - Incidencias de vivienda en modo oscuro

## Objetivo

Migrar el tab de incidencias de la vivienda del casero al sistema de tema claro/oscuro.

## Cambios

- `frontend/app/casero/vivienda/[id]/(tabs)/incidencias.tsx` consume `useAppTheme()` y memoiza `createStyles(theme)`.
- `frontend/styles/casero/vivienda/incidencias.styles.ts` usa `AppTheme` y expone helpers dependientes del tema para prioridad y estado.
- Las tarjetas, franjas de prioridad, pills de estado, historial, separadores y estados vacios usan tokens dinamicos.

## Verificacion

- Revision de la pantalla contra el checklist de modo oscuro del frontend.
