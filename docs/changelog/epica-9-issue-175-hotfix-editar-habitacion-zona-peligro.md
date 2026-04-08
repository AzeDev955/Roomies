# Issue #175 — Rework UI de Editar Habitación (Hotfix Épica 9)

**Fecha:** 2026-04-08
**Épica:** 9 — Diseño Amigable y Colorido

## Qué se hizo

- `nueva-habitacion.styles.ts`: añadidos `zonaPeligroSeparador` (línea divisoria `1px border`), `zonaPeligroTitulo` (caption uppercase muted), `botonDestructivoSoft` (soft tint `danger + '15'` bg, borde `danger + '40'`, `radius.lg`, `minHeight: 52`) y `botonDestructivoSoftTexto` (color `danger`, weight `600`)
- `editar-habitacion.tsx`: eliminada dependencia de `CustomButton`; botón "Guardar cambios" permanece como único CTA primario sólido; debajo se añade separador visual + título "Zona de peligro"; botones "Expulsar al inquilino" y "Eliminar habitación" reemplazados por `Pressable` con estilo `botonDestructivoSoft` — semánticos sin agresividad visual
