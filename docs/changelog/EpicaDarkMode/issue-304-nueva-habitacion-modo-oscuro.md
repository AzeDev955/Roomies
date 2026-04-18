# Issue 304 - Nueva habitacion en modo oscuro

## Objetivo

Migrar el formulario de alta de habitacion del casero al sistema de tema claro/oscuro.

## Cambios

- `frontend/app/casero/vivienda/[id]/nueva-habitacion.tsx` consume `useAppTheme()`, memoiza `createStyles(theme)` y ajusta `keyboardAppearance` segun el modo resuelto.
- `frontend/styles/casero/vivienda/nueva-habitacion.styles.ts` acepta `AppTheme` y sustituye colores estaticos por tokens dinamicos.
- Inputs, selector de tipo, switch de habitabilidad, precio privado, estado de error y CTA de guardado usan superficies, textos, bordes y soft tints adaptados a claro/oscuro.

## Verificacion

- Revision de la pantalla contra el checklist de modo oscuro del frontend.
