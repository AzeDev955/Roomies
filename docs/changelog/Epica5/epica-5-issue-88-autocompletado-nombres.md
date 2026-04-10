# Issue #88 — Autocompletado inteligente de nombres de estancias

## Resumen

Al seleccionar el tipo de una habitación en los formularios de creación, el campo nombre se rellena automáticamente con el nombre canónico de la estancia. El campo sigue siendo editable por si el casero quiere personalizar el nombre.

## Cambios

### Frontend

**`frontend/app/casero/vivienda/[id]/nueva-habitacion.tsx`**
- Añadido mapa `NOMBRE_SUGERIDO` con los nombres canónicos para BANO, COCINA y SALON.
- `handleTipoChange` ahora llama a `setNombre` con la sugerencia cuando el tipo tiene nombre canónico.
- Para DORMITORIO y OTRO no se modifica el nombre.

**`frontend/app/casero/nueva-vivienda.tsx`**
- Mismo mapa `NOMBRE_SUGERIDO` añadido al mini-formulario de habitaciones inline.
- `handleHabTipoChange` aplica la misma lógica con `setHabNombre`.

## Comportamiento

| Tipo seleccionado | Nombre autocompletado |
|---|---|
| Baño | `Baño` |
| Cocina | `Cocina` |
| Salón | `Salón` |
| Dormitorio | _(sin cambio)_ |
| Otro | _(sin cambio)_ |

El campo nombre permanece editable en todo momento — el autocompletado es una sugerencia inicial que el casero puede modificar libremente.
