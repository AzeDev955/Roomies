# Épica 7 — Issue #109 (Fases 3, 4 y 6): Interfaz de Configuración de Limpieza

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
---

## Fase 4 — Asignación de zonas fijas (Baños)

### Cambios en `limpieza.tsx`

**Nuevos tipos:** `Inquilino`, `AsignacionFija`. `ZonaLimpieza` ahora incluye `asignaciones_fijas: AsignacionFija[]`.

**Carga de inquilinos:** `GET /viviendas/:id` en paralelo con la carga de zonas (ambos en `Promise.all`). Se extraen los inquilinos filtrando `habitaciones` con `inquilino !== null`.

**Tarjeta de zona actualizada:** sección de asignación bajo el peso, separada por un borde sutil:
- Si hay asignación → `"👤 Fijo: Nombre A."` en `primary` (pressable para cambiarla)
- Si no → `"+ Asignar inquilino fijo"` en `textTertiary` (pressable para asignar)

**Modal de asignación:** segundo modal independiente del de nueva zona. Muestra el nombre de la zona como subtítulo y lista a todos los inquilinos como filas presionables. El inquilino actualmente asignado aparece resaltado con fondo `background` y checkmark `✓`. Si ya existe asignación, aparece el botón "Quitar asignación" (borde rojo, texto `danger`).

**Actualización de estado local:** tras una asignación o remoción exitosa, se actualiza `zonas` con `map()` sin recargar desde el servidor — la respuesta del POST incluye el objeto completo con `usuario` embebido.

**Endpoint de remoción:** llama a `DELETE /viviendas/:id/limpieza/zonas/:zonaId/asignacion`. Este endpoint aún no existe en el backend — pendiente de implementación en Fase 5.

### Nuevos estilos en `limpieza.styles.ts`

Añadidos: `asignacionRow`, `asignacionFija`, `asignarLink`, `modalSubtitulo`, `inquilinoRow`, `inquilinoRowActual`, `inquilinoNombre`, `inquilinoNombreActual`, `checkmark`, `botonQuitarAsignacion`, `botonQuitarTexto`.

---

## Decisiones técnicas

- **`useGlobalSearchParams` en lugar de `useLocalSearchParams`**: patrón ya establecido en `tablon.tsx` e `incidencias.tsx`. Los tabs nombrados no exponen directamente los params del segmento `[id]` padre.
- **`useEffect` en lugar de `useFocusEffect`**: la lista de zonas no cambia desde otras pantallas — no es necesario recargar en cada foco. Se recarga solo al montar el componente (cambio de vivienda).
- **`parseFloat` para el peso**: permite valores decimales (ej. `7.5`) además de enteros, consistente con el tipo `Float` del schema Prisma.
- **`Promise.all` para carga paralela**: zonas e inquilinos se cargan simultáneamente para minimizar el tiempo de spinner inicial.
---

## Fase 6 — Botón manual de generación de turnos (Testing)

### Cambios en `limpieza.tsx`

**Nuevo estado:** `generando: boolean` — deshabilita el botón y actualiza su label mientras la petición está en vuelo.

**`handleGenerarTurnos`:** llama a `POST /viviendas/:id/limpieza/generar`. Usa `Alert.alert` (nativo, no Toast) porque requiere confirmación de lectura por parte del usuario:
- **Éxito (201):** `Alert.alert('¡Turnos generados!', '...')` — el casero sabe que el reparto se ha ejecutado.
- **Error (400):** muestra el `error` del body del backend directamente — así el guard anti-duplicados (`'Ya existen turnos para la próxima semana'`) aparece con texto legible sin código adicional en el frontend.

**`<CustomButton variant="primary">`** posicionado sobre la lista, con margen lateral (`styles.botonGenerar`). Se deshabilita mientras `generando || loading` para evitar doble envío durante la carga inicial de zonas.

### Cambios en `limpieza.styles.ts`

`botonGenerar`: margen `base` en todos los lados, sin `marginBottom` para respetar el spacing interno del `FlatList.contentContainerStyle`.

---

## Decisiones técnicas

- **Un solo inquilino por zona**: el modelo `AsignacionLimpiezaFija` tiene `@@unique([zona_id, usuario_id])` pero el algoritmo asume una asignación por zona. La UI toma `asignaciones_fijas[0]` y reemplaza al asignar uno nuevo.
- **Remoción pendiente de backend**: el frontend llama a `DELETE /viviendas/:id/limpieza/zonas/:zonaId/asignacion`; si el endpoint no existe aún, el toast de error informa al usuario sin romper el estado local.
