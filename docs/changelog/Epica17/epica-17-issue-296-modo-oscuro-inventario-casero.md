# Epica 17 - Issue 296 - Modo oscuro en inventario del casero

## Objetivo

Migrar la pantalla de inventario del casero al sistema de tema claro y oscuro para respetar la preferencia configurada en Perfil.

## Cambios

- Frontend casero: `Inventario` consume `useAppTheme()` y memoiza sus estilos con el tema activo.
- Frontend casero: los estilos de inventario pasan a `createStyles(theme)` y sustituyen colores estaticos por `theme.colors`.
- Frontend casero: los chips de estado, iconos, FAB, modal de foto, inputs y estados vacios usan superficies y textos adaptados a claro/oscuro.

## Verificacion

- `npm run lint` en `frontend`.
