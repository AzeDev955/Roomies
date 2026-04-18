# Issue 309 - Inventario del inquilino en modo oscuro

## Objetivo

Migrar la pantalla Inventario del inquilino al sistema de tema claro/oscuro de la epica de modo oscuro.

## Cambios

- `frontend/app/inquilino/(tabs)/inventario.tsx` consume `useAppTheme()` y memoiza estilos e indicadores de estado con el tema activo.
- `frontend/styles/inquilino/inventario.styles.ts` pasa a exponer `createStyles(theme)` y `createEstadoItemStyles(theme)` para eliminar colores estaticos principales.
- Galeria, estados vacios, badges de validacion, modal de revision, overlay e iconos usan colores derivados de la preferencia manual o del sistema.

## Verificacion

- `npm run lint`
