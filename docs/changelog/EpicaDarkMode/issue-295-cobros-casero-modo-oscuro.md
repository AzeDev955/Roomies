# Issue 295 - Cobros del casero en modo oscuro

## Objetivo

Migrar el dashboard de cobros del casero al sistema de tema claro/oscuro, incluyendo modales, formularios y listados de deudas.

## Cambios

- `frontend/app/casero/(tabs)/cobros.tsx` consume `useAppTheme()`, memoiza `createStyles(theme)` y usa colores dinamicos en iconos, loaders, placeholders y enlaces de factura/justificante.
- `frontend/styles/casero/cobros.styles.ts` acepta `AppTheme` y centraliza los badges de deuda con `getEstadoBadgeColors(theme)`.
- Los resumenes, selectores de vivienda, acordes, modales, banners, inputs, adjuntos, reparto manual y tarjetas de deuda usan superficies, textos, bordes y overlays adaptados a claro/oscuro.

## Verificacion

- Revision de la pantalla contra el checklist de modo oscuro del frontend.
