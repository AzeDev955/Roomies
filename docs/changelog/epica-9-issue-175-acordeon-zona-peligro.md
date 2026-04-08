# Issue #175 — Acordeón de Zona de Peligro en Editar Habitación

**Fecha:** 2026-04-08
**Épica:** 9 — UI/UX Refresh

## Qué se hizo

- Importado `LayoutAnimation` de `react-native` e `Ionicons` de `@expo/vector-icons` en `editar-habitacion.tsx`
- Añadido estado `mostrarPeligro` y función `togglePeligro` con animación `easeInEaseOut`
- Refactorizada la zona de peligro: cabecera tipo acordeón (`Pressable`) con icono chevron dinámico que expande/colapsa los botones destructivos
- Los botones de "Expulsar al inquilino" y "Eliminar habitación" ahora solo se renderizan si `mostrarPeligro` es `true`
- Añadido estilo `acordeonCabecera` en `nueva-habitacion.styles.ts` (row, space-between) para la cabecera del acordeón
- Cambiado color de `zonaPeligroTitulo` de `textMuted` a `danger` para reforzar la semántica visual
- Eliminado `marginBottom` de `zonaPeligroTitulo` (ahora lo gestiona el contenedor `acordeonCabecera`)
