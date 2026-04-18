# Issue 310 - Limpieza del inquilino en modo oscuro

## Objetivo

Migrar la pantalla Limpieza del inquilino al sistema de tema claro/oscuro de la epica de modo oscuro.

## Cambios

- `frontend/app/inquilino/(tabs)/limpieza.tsx` consume `useAppTheme()` y memoiza `createStyles(theme)` para respetar la preferencia manual o del sistema.
- `frontend/styles/inquilino/limpieza.styles.ts` pasa a exponer `createStyles(theme)` y sustituye colores estaticos principales por tokens dinamicos de la paleta activa.
- Turnos, estados vacios, iconos, badges, acciones y filas de companeros usan colores derivados del tema activo.

## Verificacion

- `npm run lint`
