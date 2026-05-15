# Issue 316 - Revision final del frontend en modo oscuro

## Objetivo

Revisar el frontend completo tras la migracion a modo oscuro y cerrar huecos en componentes heredados y documentacion.

## Cambios

- `frontend/hooks/use-theme-color.ts` pasa a leer el `AppThemeProvider` para respetar el selector manual de Perfil, no solo la preferencia del sistema.
- `frontend/components/themed-text.tsx`, `themed-view.tsx`, `parallax-scroll-view.tsx` y `ui/collapsible.tsx` consumen el tema activo.
- Se documentan las pantallas tematizadas que no tenian changelog propio dentro de `docs/changelog/EpicaDarkMode/`.
- Se actualizan las guias de frontend y el contexto del proyecto con el estado actual del modo oscuro.

## Verificacion

- Revision estatica de rutas y estilos de `frontend/app`, `frontend/styles`, `frontend/components` y `frontend/hooks`.
