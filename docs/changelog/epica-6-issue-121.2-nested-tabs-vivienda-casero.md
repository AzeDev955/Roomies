# Épica 6 — Issue #121-2: Nested Tabs en Detalle de Vivienda (Casero)

**Fecha:** 2026-04-02  
**Rama:** dev  
**Archivos modificados:** 9

---

## Resumen

Reestructura la ruta dinámica `/casero/vivienda/[id]` para que el casero disponga de un centro de mandos propio con tres pestañas inferiores (Resumen, Incidencias, Tablón) al entrar en una vivienda, sin perder el bottom nav principal ni quedar atrapado en la pantalla.

---

## Cambios por área

### Arquitectura de navegación

```
casero/ Stack
  └── vivienda/[id]/ Stack        ← nuevo _layout.tsx
        ├── (tabs)/ Tabs          ← nuevo (tabs)/_layout.tsx
        │   ├── index.tsx         ← Resumen
        │   ├── incidencias.tsx   ← Incidencias con filtro por habitación
        │   └── tablon.tsx        ← Tablón de la vivienda
        ├── editar-habitacion.tsx ← Stack push (sin tab bar)
        └── nueva-habitacion.tsx  ← Stack push (sin tab bar)
```

**Antes:** `[id].tsx` era una pantalla Stack plana; el usuario perdía el bottom nav y no tenía acceso directo a incidencias ni tablón desde el detalle.  
**Después:** doble capa Stack + Tabs anidados. Los modales de edición/creación siguen siendo Stack pushes encima de las tabs (el tab bar desaparece solo cuando se edita).

### Nuevos archivos

| Archivo                                           | Descripción                                                                                                                                                                      |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/casero/vivienda/[id]/_layout.tsx`            | Stack externo sin header. Contiene las tabs y los modales `editar-habitacion` / `nueva-habitacion` como Stack screens.                                                           |
| `app/casero/vivienda/[id]/(tabs)/_layout.tsx`     | Tabs con `Ionicons`, colores de `Theme` y botón `←` (headerLeft) que ejecuta `router.back()` para volver a la lista de viviendas.                                                |
| `app/casero/vivienda/[id]/(tabs)/index.tsx`       | Tab "Resumen": habitaciones con códigos de invitación, inquilinos, FAB para nueva habitación. Contenido de `[id].tsx` original sin los enlaces textuales a incidencias y tablón. |
| `app/casero/vivienda/[id]/(tabs)/incidencias.tsx` | Tab "Incidencias": migrada desde `[id]/incidencias.tsx` + filtro horizontal deslizable por habitación.                                                                           |
| `app/casero/vivienda/[id]/(tabs)/tablon.tsx`      | Tab "Tablón": nueva pantalla específica de la vivienda. El casero puede eliminar cualquier anuncio (sin restricción de autoría).                                                 |

### Archivos eliminados

| Archivo                                    | Motivo                                   |
| ------------------------------------------ | ---------------------------------------- |
| `app/casero/vivienda/[id].tsx`             | Reemplazado por `(tabs)/index.tsx`       |
| `app/casero/vivienda/[id]/incidencias.tsx` | Reemplazado por `(tabs)/incidencias.tsx` |

### `styles/casero/vivienda/incidencias.styles.ts`

Añadidos estilos para el filtro por habitación:

- `filtros` — contenedor `ScrollView` horizontal con separador inferior
- `filtroPill` / `filtroPillActivo` — pills de selección con `Theme.colors.primary` activo
- `filtroPillTexto` / `filtroPillTextoActivo`

---

## Decisiones técnicas

- **Stack + Tabs anidados**: el `[id]/_layout.tsx` es un Stack para que `editar-habitacion` y `nueva-habitacion` se comporten como stack pushes (ocultan el tab bar, `router.back()` regresa a las tabs). Si `_layout.tsx` fuera directamente Tabs, esas pantallas se convertirían en tabs y perderían el comportamiento modal.
- **URLs inalteradas**: `(tabs)` es un route group transparente en Expo Router. Las rutas `/casero/vivienda/123/incidencias` y `/casero/vivienda/123/nueva-habitacion` siguen funcionando igual.
- **`router.back()` en el header**: al ser el Stack de `casero/` quien posee la pantalla de vivienda, `router.back()` desde las tabs hace pop en ese Stack y regresa a la lista de viviendas. No se usa `router.replace` para no romper el historial de navegación.
- **Filtro por habitación en Incidencias**: deriva la lista de habitaciones únicas de las propias incidencias cargadas — sin llamada extra a la API. Solo aparece si hay más de una habitación con incidencias. El filtro es stateless (no persiste entre focuses).
- **Tablón del casero**: el casero puede eliminar cualquier anuncio (`puedeEliminar` siempre `true`), a diferencia del tablón del inquilino que solo puede borrar los propios. Se reutilizan los estilos de `styles/tablon/tablon.styles.ts`.
- **Confirmaciones destructivas**: `Alert.alert` se mantiene para eliminar anuncio (mismo criterio que el resto de la app: acciones con botón Cancel/OK).
