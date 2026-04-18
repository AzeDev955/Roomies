# Issue 307 - Inicio del inquilino en modo oscuro

## Objetivo

Migrar el dashboard Inicio del inquilino al sistema de tema claro/oscuro de la epica de modo oscuro.

## Cambios

- `frontend/app/inquilino/(tabs)/inicio.tsx` consume `useAppTheme()` y memoiza `createStyles(theme)` para respetar la preferencia manual o del sistema.
- `frontend/styles/inquilino/inicio.styles.ts` pasa a aceptar `AppTheme` y sustituye colores estaticos por tokens dinamicos de la paleta activa.
- El onboarding, dashboard, companeros, zonas comunes, incidencias, estado vacio, FAB y modal de companero usan colores derivados del tema activo.

## Verificacion

- `npm run lint`
