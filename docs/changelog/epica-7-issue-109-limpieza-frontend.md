# Épica 7 — Issue #109 (Fase 3): Interfaz de Configuración de Limpieza

**Fecha:** 2026-04-03  
**Rama:** dev  
**Archivos modificados/creados:** 3

---

## Resumen

Añade una cuarta pestaña "Limpieza" al centro de mandos de cada vivienda. El casero puede consultar las zonas de limpieza definidas y crear nuevas zonas con nombre y peso desde un modal de pantalla completa.

---

## Cambios por archivo

### `app/casero/vivienda/[id]/(tabs)/_layout.tsx`

Nueva pestaña `limpieza` añadida al `<Tabs>` existente:

- **Icono:** `sparkles-outline` (Ionicons)
- **Posición:** cuarta pestaña, tras Tablón
- **Título:** "Limpieza"

No se modificó ningún otro aspecto del layout (header, back button, colores).

---

### `app/casero/vivienda/[id]/(tabs)/limpieza.tsx` (nuevo)

Pantalla de gestión de zonas de limpieza para el casero.

**Extracción de params:** `useGlobalSearchParams` — necesario en tabs nombrados para leer el `id` del segmento padre `[id]`.

**Carga de datos:** `useEffect` → `GET /viviendas/:id/limpieza/zonas`. Spinner mientras carga; toast de error si falla.

**Lista:** `FlatList` de `<Card>` (componente base del sistema de diseño). Cada tarjeta muestra:
- Nombre de la zona en negrita
- Badge "Activa" (verde) / "Inactiva" (gris)
- Peso como `"Peso: X"` en `textSecondary`

**FAB:** botón flotante `+` en esquina inferior derecha (mismo patrón que `tablon.tsx`).

**Modal:** `KeyboardAvoidingView` con dos `<CustomInput>` (nombre y peso). Validación inline: el botón "Guardar" permanece deshabilitado si el nombre está vacío o el peso no es un número positivo. Al guardar, `POST /viviendas/:id/limpieza/zonas` → la zona nueva se añade al final de la lista local sin recargar.

---

### `styles/casero/vivienda/limpieza.styles.ts` (nuevo)

Estilos modulares siguiendo la convención del proyecto (un `.styles.ts` por pantalla).

Incluye: `container`, `content`, `emptyText`, `cardRow`, `zonaNombre`, `badge` (con variantes `Activa`/`Inactiva`), `zonaPeso`, `fab`, `fabTexto`, `fabPressed`, `modalOverlay`, `modalContainer`, `modalTitulo`, `modalAcciones`, `botonCancelar*`, `botonGuardar*`, `botonPressed`.

---

## Decisiones técnicas

- **`useGlobalSearchParams` en lugar de `useLocalSearchParams`**: patrón ya establecido en `tablon.tsx` e `incidencias.tsx`. Los tabs nombrados no exponen directamente los params del segmento `[id]` padre.
- **`useEffect` en lugar de `useFocusEffect`**: la lista de zonas no cambia desde otras pantallas — no es necesario recargar en cada foco. Se recarga solo al montar el componente (cambio de vivienda).
- **`parseFloat` para el peso**: permite valores decimales (ej. `7.5`) además de enteros, consistente con el tipo `Float` del schema Prisma.
- **Sin gestión de asignaciones fijas en esta fase**: la pantalla muestra solo lectura de zonas con sus badges. La asignación fija de inquilinos a zonas se implementará en la Fase 4.
