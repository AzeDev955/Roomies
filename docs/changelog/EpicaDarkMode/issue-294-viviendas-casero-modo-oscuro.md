# Issue 294 - Viviendas del casero en modo oscuro

## Objetivo

Migrar la lista global de viviendas del casero al sistema de tema claro/oscuro para que respete la preferencia configurada en Perfil.

## Cambios

- `frontend/app/casero/(tabs)/viviendas.tsx` consume `useAppTheme()` y memoiza `createStyles(theme)`.
- `frontend/styles/casero/viviendas.styles.ts` usa `AppTheme` y sustituye fondos, textos, chips, contadores, FAB, estados vacios y sombras por `theme.colors`.
- Los iconos, contadores de habitaciones/inquilinos y estados de viviendas usan tokens dinamicos en lugar de colores estaticos.

## Verificacion

- Revision de la pantalla contra el checklist de modo oscuro del frontend.
