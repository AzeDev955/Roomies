# Issue 298 - Perfil de inquilino del casero en modo oscuro

## Objetivo

Migrar el perfil de contacto del inquilino visto por el casero al sistema de tema claro/oscuro de la epica de modo oscuro.

## Cambios

- `frontend/app/casero/inquilino/[id].tsx` consume `useAppTheme()` y memoiza `createStyles(theme)` para respetar la preferencia manual o del sistema.
- La cabecera, los iconos de contacto y el estado de error usan colores dinamicos desde `theme.colors`.
- `frontend/styles/casero/inquilino/perfil.styles.ts` sustituye tokens estaticos por `AppTheme`, cubriendo fondo, avatar, textos, card de contacto, separadores y estado de error.

## Verificacion

- `npm run lint`
- `npx tsc --noEmit`
