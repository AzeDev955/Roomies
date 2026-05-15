# Issue 308 - Gastos del inquilino en modo oscuro

## Objetivo

Migrar la pantalla Gastos del inquilino al sistema de tema claro/oscuro de la epica de modo oscuro.

## Cambios

- `frontend/app/inquilino/(tabs)/gastos.tsx` consume `useAppTheme()` y memoiza `createStyles(theme)` para respetar la preferencia manual o del sistema.
- `frontend/styles/inquilino/gastos.styles.ts` pasa a aceptar `AppTheme` y sustituye colores estaticos por tokens dinamicos de la paleta activa.
- Deudas, facturas, justificantes, estados vacios, bottom sheets, selector de participantes y FAB usan colores derivados del tema activo.

## Verificacion

- `npm run lint`
