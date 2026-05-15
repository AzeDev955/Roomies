# Issue 311 - Tablon del inquilino en modo oscuro

## Objetivo

Migrar el Tablon del inquilino al sistema de tema claro/oscuro de la epica de modo oscuro.

## Cambios

- `frontend/app/inquilino/(tabs)/tablon.tsx` consume `useAppTheme()` y memoiza `createStyles(theme)` para respetar la preferencia manual o del sistema.
- La lista, estado vacio, FAB, modal de publicacion, inputs, indicadores e iconos consumen colores del tema activo.
- `frontend/styles/tablon/tablon.styles.ts` mantiene estilos compartidos con `createStyles(theme)` para que el tablon del inquilino herede la paleta clara u oscura sin romper el resto de tablones.

## Verificacion

- `rg "#[0-9A-Fa-f]{3,8}|rgba\\(|Theme\\.colors" -n -- "frontend/app/inquilino/(tabs)/tablon.tsx" "frontend/styles/tablon/tablon.styles.ts"`
