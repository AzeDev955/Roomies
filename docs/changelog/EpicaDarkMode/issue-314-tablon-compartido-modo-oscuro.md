# Issue 314 - Pantallas compartidas de Tablon en modo oscuro

## Objetivo

Cerrar la revision compartida del sistema de Tablon para que los tres consumidores mantengan una migracion consistente en tema claro y oscuro.

## Cambios

- `frontend/styles/tablon/tablon.styles.ts` centraliza el color de contenido sobre acciones primarias y refuerza contraste en tarjetas, modal, inputs y controles destructivos con tokens del tema activo.
- `frontend/app/tablon/[viviendaId].tsx`, `frontend/app/inquilino/(tabs)/tablon.tsx` y `frontend/app/casero/vivienda/[id]/(tabs)/tablon.tsx` reutilizan el mismo color de accion primaria para FAB, spinner y boton de publicacion.
- Las dos tabs de casero e inquilino incorporan cursor, seleccion y teclado adaptados al tema para evitar divergencias con la pantalla compartida.

## Verificacion

- `npm run lint` (sin errores; mantiene warnings previos en `index.tsx` y `limpieza.tsx`).
- `npx tsc --noEmit`
