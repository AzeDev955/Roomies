# Épica 7 — Issue #109 (Fases 3, 4, 6, 7 y 8): Interfaz de Configuración de Limpieza

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

- **Sync en lugar de upsert**: el endpoint de asignación ahora hace delete+createMany en transacción. Más simple que rastrear qué IDs añadir/quitar individualmente, y garantiza que el estado en BD siempre coincide exactamente con lo que el casero envió.
- **Sub-rotación via balance existente**: la Fase A del algoritmo no necesita estado adicional para rotar entre co-responsables — reutiliza `balance_limpieza` exactamente igual que la Fase B. El efecto emergente es una rotación justa sin lógica de turno explícita.
- **"Quitar todos" = guardar con array vacío**: eliminar el modal de "Quitar asignación" simplifica la UX. Desmarcar a todos en el multi-select y pulsar Guardar tiene el mismo efecto con menos superficie de UI.

---

## Fase 7 — Multi-asignación y sub-rotación (baños compartidos)

### `backend/src/controllers/limpieza.controller.ts` — `asignarZonaFija`

**Contrato del endpoint cambiado:** recibe `{ usuario_ids: number[] }` en lugar de `{ usuario_id: number }`.

**Operación sync atómica** dentro de `prisma.$transaction`: deleteMany → createMany → findMany. Si `usuario_ids` es `[]`, solo se ejecuta el deleteMany → equivale a "quitar todos".

### `backend/src/services/limpieza.service.ts` — Fase A con sub-rotación

```
asignadosActivos = asignaciones_fijas.filter(a => a.usuario está ACTIVO)
elegido = argmin(asignadosActivos, u => cargaSemanal[u] + balance_limpieza[u])
```

Si Ana y Juan comparten Baño 1: el que tenga menor carga efectiva esa semana recibe el turno. La Fase C actualiza su balance → la próxima semana el otro tendrá menor carga. Rotación automática sin estado adicional.

### `frontend/app/casero/vivienda/[id]/(tabs)/limpieza.tsx`

- `seleccionados: number[]` — IDs marcados en el modal, inicializados desde `asignaciones_fijas` actuales.
- `toggleSeleccion(id)` — añade o quita del array (comportamiento checkbox).
- `handleGuardarAsignacion` — envía `{ usuario_ids: seleccionados }`, actualiza estado local con la respuesta.
- Card muestra todos los asignados: `"👤 Fijos: Juan G., María P."`.
- Modal: botón "Guardar" al final en lugar de acción inmediata al tocar.

---

## Fase 8 — T-Shirt Sizing, Quick Chips y Starter Pack

### T-Shirt Sizing (abstracción del peso)

El input de texto libre para `peso` se reemplaza por tres botones exclusivos:

| Botón | Peso interno |
|---|---|
| Ligera | 3 |
| Normal | 6 |
| Intensa | 10 |

El estado `pesoSeleccionado: number | null` reemplaza al string `peso`. El botón "Guardar" permanece deshabilitado hasta que se selecciona una talla. El casero nunca ve números — solo etiquetas semánticas.

**En la tarjeta (`renderZona`):** `"Peso: 10"` → `"Esfuerzo: Intensa"` vía el mapa `ETIQUETA_ESFUERZO`. Para valores que no están en el mapa (creados con la API directamente) se muestra `"Peso: X"` como fallback.

### Quick Chips

Fila de pastillas presionables encima del `CustomInput` de nombre: `Cocina`, `Baño`, `Salón`, `Pasillo`. Al pulsar, rellenan el campo nombre — reducen friction para los casos más comunes sin eliminar la edición libre.

### Starter Pack (empty state)

Cuando no hay zonas (`zonas.length === 0`), el `ListEmptyComponent` muestra el texto vacío y un `<CustomButton variant="outline">` "Generar zonas básicas".

Al pulsar, `handleGenerarZonasBasicas` hace tres POST en paralelo (`Promise.all`): Cocina (Intensa/10), Salón (Normal/6), Baño (Normal/6). Las zonas creadas se añaden al estado local con `asignaciones_fijas: []`. Estado separado `creandoBase` para no bloquear el botón de generar turnos.

### Estilos añadidos en `limpieza.styles.ts`

`emptyContainer`, `chipRow`, `chip`, `chipTexto`, `tshirtLabel`, `tshirtRow`, `tshirtBtn`, `tshirtBtnActivo`, `tshirtBtnTexto`, `tshirtBtnTextoActivo`.

### Decisiones técnicas

- **`primary + '12'` como fondo del botón activo**: añadir `12` al hex del color primario da un 7% de opacidad — más ligero que un tint fijo, automáticamente consistente si el color primario cambia.
- **`pesoSeleccionado: number | null`**: null explícito en lugar de `0` evita que el botón "Guardar" se active accidentalmente si el casero no ha elegido talla.
- **Starter Pack con `Promise.all`**: crea las tres zonas en paralelo en lugar de secuencialmente. Si alguna falla, el `catch` muestra toast pero las creadas exitosamente sí aparecen (no hay rollback, diseño intencional para MVP).

---

## Fase 9 — Eliminación de zonas

### Backend

**`eliminarZona`** (`DELETE /viviendas/:id/limpieza/zonas/:zonaId`):
- Verifica propiedad de vivienda y existencia de zona.
- Ejecuta `prisma.$transaction([deleteMany turnos, deleteMany asignaciones, delete zona])` — el schema no define `onDelete: Cascade`, así que los registros dependientes se eliminan explícitamente antes de borrar la zona.

### Frontend

**Botón ✕** en el `cardRow` de cada zona, junto al badge de estado. Al pulsar:
1. `Alert.alert` con confirmación destructiva — el mensaje advierte que se borran asignaciones y turnos.
2. Si confirma → `DELETE /viviendas/:id/limpieza/zonas/:zonaId` → `setZonas(prev.filter(...))`.

Estilo `eliminarBtn`: mismo patrón que el ✕ del tablón de anuncios (`textTertiary`, `fontWeight 600`).

---

## Fase 10 — Calendario de Turnos y Pantalla del Inquilino

### Backend — nuevos endpoints

**`obtenerTurnos`** (`GET /viviendas/:id/limpieza/turnos`):
- Autorización dual: si no es casero de la vivienda, verifica que el usuario tenga una `Habitacion` en ella. Cubre el acceso del inquilino sin necesidad de un rol en el JWT.
- Filtra por semana en curso: lunes 00:00 — domingo 23:59:59, calculado dinámicamente.
- Devuelve los `TurnoLimpieza` con `zona` (id, nombre, peso) y `usuario` (id, nombre, apellidos) embebidos, ordenados por usuario y luego por peso desc.

**`marcarTurnoHecho`** (`PATCH /viviendas/:id/limpieza/turnos/:turnoId/hecho`):
- Sin body — siempre establece `estado: 'HECHO'`.
- Seguridad: si `turno.usuario_id !== req.usuario.id`, comprueba si el llamante es casero de la vivienda antes de permitirlo.
- Devuelve el turno actualizado con las mismas relaciones incluidas que `obtenerTurnos`.

Rutas registradas en `limpieza.routes.ts`:
```
GET  /:id/limpieza/turnos
PATCH /:id/limpieza/turnos/:turnoId/hecho
```

### Frontend Casero — Segmented Control (Calendario / Configuración)

**`app/casero/vivienda/[id]/(tabs)/limpieza.tsx`** — reestructurado:

- Estado `vistaActual: 'CONFIG' | 'CALENDARIO'`. Por defecto, `'CONFIG'`.
- `useEffect` sobre `vistaActual`: cuando cambia a `'CALENDARIO'`, llama automáticamente a `cargarTurnos()`.
- **Vista CONFIG**: contenido existente intacto (botón generar, FlatList de zonas, FAB, modales).
- **Vista CALENDARIO**: `renderCalendario()` — `ScrollView` con:
  - `semanaLabel`: fecha de lunes a domingo en formato `"7 abr — 13 abr"`.
  - Cards agrupadas por `usuario_id`: reduce el array de turnos a `Record<id, { usuario, items[] }>` y renderiza una `Card` por persona con filas `zona.nombre ↔ estado`.
  - Estado vacío si no hay turnos: mensaje invitando a ir a Configuración y generar.

Estilos añadidos en `limpieza.styles.ts`: `segmentedControl`, `segTab`, `segTabActivo`, `segTabTexto`, `segTabTextoActivo`, `semanaLabel`, `calendarioNombreUsuario`, `turnoRow`, `turnoZona`, `turnoEstado`.

### Frontend Inquilino — Nueva pestaña "Limpieza"

**`app/inquilino/(tabs)/limpieza.tsx`** (nuevo):
- `useFocusEffect(cargarDatos)`: recarga en cada entrada al tab para reflejar turnos generados por el casero.
- `cargarDatos`: primero `GET /inquilino/vivienda` (obtiene `viviendaId` + `miUsuarioId`), luego `GET /viviendas/:id/limpieza/turnos`.
- **"Mi Tarea"**: filtra `turnos` por `usuario_id === miUsuarioId`. Por cada turno:
  - Nombre de zona en grande, etiqueta de esfuerzo (T-Shirt).
  - Badge de estado coloreado (verde/gris/rojo).
  - Botón `✅ Marcar como Hecho` visible solo si estado `PENDIENTE`. Llama a `PATCH .../turnos/:id/hecho` y actualiza el estado local con el turno devuelto por el servidor.
- **"Turnos de la casa"**: agrupa el resto de turnos por `usuario_id`. Card por compañero con lista de zonas y su estado (sin botón de acción — solo visibilidad).
- Estado vacío global: si no hay turnos, mensaje explicando que el casero aún no los ha generado.

**`app/inquilino/(tabs)/_layout.tsx`** — pestaña añadida antes de "Perfil":
```tsx
<Tabs.Screen name="limpieza" options={{ title: 'Limpieza', tabBarIcon: sparkles-outline }} />
```

**`styles/inquilino/limpieza.styles.ts`** (nuevo): `container`, `content`, `emptyContainer`, `emptyText`, `semanaLabel`, `seccionTitulo`, `zonaNombreMia`, `esfuerzoTexto`, `estadoRow`, `estadoBadge{Pendiente,Hecho,NoHecho}`, `estadoTexto{Pendiente,Hecho,NoHecho}`, `botonHecho`, `botonHechoPressed`, `botonHechoTexto`, `companeroNombre`, `companeroTurnoRow`, `companeroZona`, `companeroEstado{Hecho,Pendiente}`.

---

## Fase 11 — Rediseño visual basado en mocks (UI/UX)

### Referencia de diseño

Integración de mocks HTML/Tailwind del equipo de diseño. Toda la lógica de negocio (endpoints, estados React, handlers) se ha mantenido intacta. Solo se han sustituido el JSX de renderizado y los StyleSheet.

### Sub-componentes añadidos (en ambos archivos)

**`AvatarInitials`** — componente funcional puro, definido en el mismo archivo:
- Calcula iniciales a partir de `nombre[0] + apellidos[0]`.
- Parametrizable por `size` (default 44/48 según pantalla).
- Fondo `#EAF0FF` (inquilino) / `#E8E8E8` (casero) con texto en el color correspondiente.

**`zonaIcon(nombre)`** — helper que mapea el nombre de zona a un icono de `@expo/vector-icons/Ionicons`:
- `cocina` → `restaurant-outline`, `baño*` → `water-outline`, `salón` → `tv-outline`, `pasillo` → `footsteps-outline`, resto → `sparkles-outline`.

### `app/casero/vivienda/[id]/(tabs)/limpieza.tsx` — vista CALENDARIO

**Cabecera nueva**: etiqueta `"GESTIÓN"` (11px, primario, uppercase, tracking 1.5) + título `"Limpieza"` (36px, black, tracking -0.5) + botón pill `"Configurar Zonas"` que activa `setVistaActual('CONFIG')`.

**Navegación de semana** rediseñada: pill card blanca con sombra, chevrones `‹ ›` en `textMedium`.

**Cards de usuario** (`userCard`): `borderRadius: 24`, sombra ligera, borde `rgba(0,0,0,0.04)`.
- Header: `AvatarInitials` (48px, fondo gris) + nombre completo en bold + conteo de tareas en uppercase tiny.
- Filas de turno: fondo `background`, `borderRadius: 16`, icono en wrapper primario/15 + nombre en bold + badge de estado.
- Badge `HECHO`: `#E1F5E8` / `#248A3D`. Badge `PENDIENTE`: `surface2` / `textTertiary`.

### `app/inquilino/(tabs)/limpieza.tsx`

**Cabecera**: semana en `primary` uppercase, `"Mis Tareas"` en 30px/800, subtítulo gris.

**Cards "Mi Tarea"** (`miTareaCard`): `borderRadius: 24`, sombra.
- Top row: nombre de zona en 22px/700 + etiqueta de esfuerzo uppercase + `miTareaIconBox` con `primary + '0D'` de fondo (verde `#E1F5E8` si hecho).
- Botón `"Marcar como Hecho"`: full-width, `borderRadius: 16`, fila con `Ionicons checkmark-circle` + texto.
- Estado hecho: sustituye el botón por badge `"Completado"` en `#E1F5E8`.

**Filas de compañeros** (planas, una por turno en lugar de agrupadas por persona):
- `AvatarInitials` (44px, fondo `#EAF0FF`, texto primario) + zona en bold + estado en uppercase (`orange` pendiente / verde hecho) + `"ASIGNADO A CARLOS"` en tiny uppercase + icono de zona a la derecha.

### `styles/casero/vivienda/limpieza.styles.ts` — tokens añadidos/actualizados
`calendarioHeader`, `calendarioGestion`, `calendarioTitulo`, `calendarioBtnConfig`, `calendarioBtnConfigTexto`, `semanaNav` (pill card), `userCard`, `userCardHeader`, `userNombre`, `userSubtitle`, `turnoRow`, `turnoIconWrapper`, `turnoZona`, `turnoEstadoBadge{Hecho,Pendiente}`, `turnoEstadoTexto{Hecho,Pendiente}`.

### `styles/inquilino/limpieza.styles.ts` — reescritura completa
Reemplaza la hoja de estilos anterior. Tokens: `header`, `headerSemana`, `headerTitulo`, `headerSubtitulo`, `seccionTitulo`, `miTareaCard`, `miTareaCardHecha`, `miTareaTop`, `miTareaTexto`, `miTareaZona`, `miTareaEsfuerzo`, `miTareaIconBox`, `miTareaIconBoxHecha`, `botonHecho`, `botonHechoPressed`, `botonHechoTexto`, `badgeHecho`, `badgeHechoTexto`, `companeroRow`, `companeroInfo`, `companeroTurnoTop`, `companeroZonaNombre`, `companeroEstado{Pendiente,Hecho}`, `companeroAsignado`.

---

## Fase 12 — Rediseño visual del Dashboard del Inquilino

### Referencia de diseño
Integración de mock HTML/Tailwind. Toda la lógica de negocio (`useFocusEffect`, `cargarVivienda`, `cargarIncidencias`, `actualizarEstado`, `abandonarVivienda`, `tienePermisoEditar`) permanece intacta.

### `app/inquilino/(tabs)/inicio.tsx`

**Imports añadidos**: `Ionicons` de `@expo/vector-icons`, `CustomButton`.

**Helpers nuevos** (antes del componente):
- `ZONA_ICONS` — mapea `TipoHabitacion` a iconos Ionicons (`BANO→water-outline`, `COCINA→restaurant-outline`, `SALON→tv-outline`, `OTRO→grid-outline`).
- `ESTADO_BADGE_BG / ESTADO_BADGE_COLOR` — colores de fondo/texto para badges de incidencia por estado (naranja, primario, verde).
- `AvatarInitials` — sub-componente puro: círculo `#E5E5EA` con bordes `surface` y sombra, iniciales en `fontWeight 600`.
- `formatearFechaCorta` — formato corto `"12 oct"` para tarjetas de incidencia.
- `irAReportarIncidencia` — extrae la navegación al FAB y al botón "Reportar problema" evitando duplicación.

**Sección Saludo**: "¡Hola, {nombre}!" a 34px/800 + subtítulo `{vivienda} · {habitacion}`. El nombre se obtiene de `habitaciones.find(id === miHabitacionId).inquilino.nombre`.

**Sección Compañeros**: `ScrollView horizontal` con `AvatarInitials` (56px) + nombre truncado bajo cada avatar. Sin botón "Invitar" (sin permisos de inquilino).

**Sección Zonas Comunes**: lista vertical de `zonaRow` — icono en `zonaIconBox` (primario/12 de fondo, `borderRadius sm`) + nombre en bold + `chevron-forward`.

**Sección Incidencias** (`renderIncidencia` reescrito):
- Header: título (17px/700) + `"Tú"` o `"Compañero"` según `creador_id` + fecha corta + badge de estado con `ESTADO_BADGE_BG/COLOR`.
- Descripción: 2 líneas, `textSecondary`.
- Selector de estados (si `tienePermisoEditar`) sin cambios funcionales.
- Botón "Reportar problema" outline al final de la sección (`Pressable` con `Ionicons warning-outline`).

**Botón "Abandonar Vivienda"**: sustituye el `Pressable` custom por `<CustomButton variant="danger">` que llama a `abandonarVivienda`.

### `styles/inquilino/inicio.styles.ts`

Onboarding sin cambios. Dashboard reescrito:
`greeting`, `greetingHola`, `greetingSubtitulo`, `seccion`, `seccionLabel`, `companerosRow`, `companeroItem`, `companeroNombreCorto`, `zonaRow`, `zonaIconBox`, `zonaRowNombre`, `incidenciaCard`, `incidenciaHeader`, `incidenciaTitulo`, `incidenciaReporter`, `estadoBadge`, `estadoBadgeTexto`, `incidenciaDescripcion`, `botonReportar`, `botonReportarTexto`, `botonAbandonar` (ahora solo `marginTop`).
