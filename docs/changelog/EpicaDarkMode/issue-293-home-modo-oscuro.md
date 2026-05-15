# Issue 293 - Home en modo oscuro

## Objetivo

Migrar la pantalla Home al sistema de tema claro/oscuro introducido en la epica de modo oscuro.

## Cambios

- `frontend/app/home.tsx` consume `useAppTheme()` y genera sus estilos con `createStyles(theme)`.
- `frontend/styles/home.styles.ts` sustituye los tokens estaticos por `AppTheme`, aplicando fondos, textos y botones desde `theme.colors`.
- Se ajustan los radios de los botones a los tokens visuales actuales para mantener consistencia con el resto de componentes tematizados.

## Verificacion

- `npm run lint`
- `npx tsc --noEmit`
- `npm test -- --runInBand`
