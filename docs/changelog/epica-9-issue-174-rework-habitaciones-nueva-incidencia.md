# Issue #174 — Rework de Habitaciones y Nueva Incidencia

**Fecha:** 2026-04-08
**Épica:** 9 — Diseño Amigable y Colorido

## Qué se hizo

- `nueva-habitacion.styles.ts`: inputs con `borderWidth: 2` + `borderColor: border` + `minHeight: 52`; añadido `inputFocused` (`borderColor: primary`, `backgroundColor: primaryLight`); pills de tipo cambiados a `radius.full` con soft tint activo (`primary + '18'` bg, texto `primary`); `switchFila` rediseñado a `radius.lg` + `borderWidth: 2` + `minHeight: 64`; botón a `radius.lg + minHeight: 52`
- `nueva-habitacion.tsx` y `editar-habitacion.tsx`: focus state tracking por campo (`focusedInput`); `placeholderTextColor` tokenizado a `Theme.colors.textMuted`; Switch `trackColor` tokenizado a `{ false: border, true: success }`
- `inquilino/nueva-incidencia.styles.ts`: misma modernización de inputs; pills de habitación a `radius.full` con soft tint; selector de prioridad reemplaza colores sólidos opacos por soft tints (`PRIORIDAD_BG`, `PRIORIDAD_TEXT`, `PRIORIDAD_BORDER`) coherentes con el módulo de incidencias (#171); botón enviar a `radius.lg + minHeight: 52`
- `casero/vivienda/nueva-incidencia.styles.ts`: ídem, mismo sistema de soft tints de prioridad
- `inquilino/nueva-incidencia.tsx` y `casero/vivienda/[id]/nueva-incidencia.tsx`: actualizados para usar `PRIORIDAD_BG/TEXT/BORDER`; pills de prioridad inactivos con `opacity: 0.55` y `borderColor: transparent`; activos con borde de su color semántico; focus states en campos; `placeholderTextColor` tokenizado; `showsVerticalScrollIndicator={false}`
