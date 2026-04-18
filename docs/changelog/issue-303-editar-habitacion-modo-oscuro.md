# Issue 303 - Edicion de habitacion en modo oscuro

## Objetivo

Migrar la pantalla de edicion de habitacion del casero al sistema de tema claro/oscuro de la epica de modo oscuro.

## Cambios

- `frontend/app/casero/vivienda/[id]/editar-habitacion.tsx` consume `useAppTheme()` y memoiza `createStyles(theme)` para respetar la preferencia manual o del sistema.
- `frontend/styles/casero/vivienda/nueva-habitacion.styles.ts` pasa a aceptar `AppTheme` y sustituye colores estaticos por tokens dinamicos en formulario, pills, acciones, estados de error y zona de peligro.
- `frontend/app/casero/vivienda/[id]/nueva-habitacion.tsx` queda adaptada al stylesheet compartido dinamico para evitar regresiones en la creacion de habitaciones.

## Verificacion

- `npm run lint` (sin errores; mantiene warnings previos en tabs de vivienda y limpieza).
