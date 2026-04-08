# Épica 7 — Rediseño Visual: Centro de Mando del Casero (Detalle de Vivienda)

**Fecha:** 2026-04-04  
**Rama:** refactor/refactorizacion-visual  
**Archivos modificados:** 4

---

## Rediseño de la lista de viviendas (`/casero/viviendas`)

**Archivos:** `app/casero/(tabs)/viviendas.tsx`, `styles/casero/viviendas.styles.ts`

### Corrección de contadores
- Tipo `Habitacion` ampliado con `tipo: string` e `inquilino_id: number | null`
- `habitacionesHabitables`: filtra `hab.tipo === 'DORMITORIO'` (antes contaba el total del array)
- `inquilinosActuales`: cuenta las habitaciones habitables con `inquilino_id !== null`

### Cambios visuales
- **Header** — "Mis Propiedades" (28 px / 800) + subtítulo "Gestiona tus pisos y habitaciones"
- **Image placeholder** — `View` 120 px, fondo `primary + 1A` (10 % opacidad), icono `business-outline` 48 px centrado
- **Tarjeta** — `Pressable` wrapper con feedback `cardWrapperPressed` (opacity 0.88) envuelve `Card`
  - Fila inferior: `alias_nombre` (20 px / 700) + `location-outline` + `direccion` + chips + `chevron-forward`
  - Chip azul (`#EFF6FF`/`#1D4ED8`) con `bed-outline` — muestra habitaciones habitables
  - Chip verde (`#ECFDF5`/`#065F46`) con `people-outline` — muestra inquilinos actuales
- **Empty state** — icono `home-outline` 64 px + título + subtítulo + `CustomButton variant="primary"` "Comenzar"
- **FAB rediseñado** — `borderRadius 32`, pill horizontal con icono `add` + texto "Nueva Vivienda"; visible solo si `viviendas.length > 0` (el empty state tiene su propio botón)
- Importados `Ionicons`, `Theme` y `CustomButton`; eliminados `ORDEN_PRIORIDAD`, `getMaxPrioridad`, `BADGE_POR_PRIORIDAD` (badges de incidencia eliminados de la lista)

### Estilos eliminados
`cardTitle`, `cardAddress`, `cardRooms`, `loaderContainer`, `emptyText`, `emptySubtext`, `fabText`, `badge`, `badgeVerde`, `badgeAmarillo`, `badgeRojo`, `badgeTexto`

### Estilos añadidos
`header`, `headerTitulo`, `headerSubtitulo`, `cardWrapper`, `cardWrapperPressed`, `card`, `cardImagePlaceholder`, `cardBody`, `cardBodyRow`, `cardInfo`, `cardTitulo`, `cardDireccionFila`, `cardDireccion`, `chips`, `chipHabitaciones*`, `chipInquilinos*`, `emptyContainer`, `emptyTitulo`, `emptySubtitulo`, `emptyBoton`, `fabTexto`

---

## Corrección de usabilidad (fix posterior)

### Tarjetas de habitación
- `View` habCard reemplazado por `Pressable` con `onPress → handleEditarHabitacion`  
  y feedback visual `habCardPressed` (opacity 0.88)
- Eliminados botones "Expulsar", "Editar" y "Eliminar" de la lista; toda la interacción
  de gestión se centraliza en la pantalla `editar-habitacion`
- Los `Pressable` internos (avatar del inquilino → perfil, biometría de código,
  incidencias individuales) funcionan correctamente sin propagar el toque a la tarjeta

### Quick actions
- Botón "Tablón" sustituido por "Nueva Incidencia" (icono `add-circle-outline`, verde `#059669`)
- Navega a `/inquilino/nueva-incidencia` pasando `viviendaId`, `miHabitacionId: 0`
  y `habitacionesJson` (reutiliza el único formulario de creación de incidencias existente;
  el casero no tiene pantalla propia para este flujo)
- Estilos eliminados: `expulsarFila`, `expulsarTexto`, `accionFila`
- Estilos añadidos: `accionIconNuevaInc`, `habCardPressed`

---

## Feature: Modal de perfil de compañero (Inquilino Dashboard)

**Archivos:** `app/inquilino/(tabs)/inicio.tsx`, `styles/inquilino/inicio.styles.ts`

- Cada item de la sección "Mis Compañeros" envuelto en `Pressable` → abre modal
- Estado `companeroModal: InquilinoResumen | null` controla visibilidad
- `Modal` nativo (`transparent`, `animationType="slide"`) con fondo `rgba(0,0,0,0.5)`
- Contenido: `AvatarInitials` 72px + nombre completo + `CustomButton variant="outline"` Cerrar
- Toque en el backdrop cierra el modal
- Estilos añadidos: `modalBackdrop`, `modalCardWrapper`, `modalContenido`, `modalNombre`
- Al abrir el modal se lanza `GET /inquilino/companeros/:id`; mientras carga muestra
  `ActivityIndicator`; al resolverse muestra email (`mail-outline`) y teléfono (`call-outline`)
  si el servidor los devuelve (ambos condicionales con `!!`)
- Cerrar modal limpia también `loadingCompañero`

## Backend: nuevo endpoint `GET /inquilino/companeros/:id`

**Archivos:** `backend/src/controllers/inquilino.controller.ts`, `backend/src/routes/inquilino.routes.ts`, `docs/backend/api.md`

- Handler `obtenerPerfilCompañero`: verifica que el solicitante tiene habitación asignada,
  luego verifica que el compañero vive en la **misma vivienda** (`vivienda_id` coincide)
- Devuelve `{ id, nombre, apellidos, email, telefono }` del compañero
- Ruta registrada antes de `/:id/perfil` para evitar colisión de segmentos dinámicos:
  `/companeros/:id` (literal+dinámico) ≠ `/:id/perfil` (dinámico+literal)
- Documentado en `docs/backend/api.md`

## Fix: Botón Expulsar en pantalla Editar Habitación

**Archivos:** `app/casero/vivienda/[id]/(tabs)/index.tsx`, `app/casero/vivienda/[id]/editar-habitacion.tsx`

- `handleEditarHabitacion` pasa nuevo param `inquilinoId: String(hab.inquilino?.id ?? '')`
- `editar-habitacion.tsx`: lee `inquilinoId` de `useLocalSearchParams`
- Handler `expulsarInquilino` → `Alert` de confirmación → `DELETE /viviendas/${id}/habitaciones/${habId}/inquilino` → `router.back()`
- `CustomButton variant="danger"` "Expulsar al inquilino" visible únicamente si `inquilinoId` es no vacío

---

## Resumen

Rediseño visual completo del tab "Resumen" de la vivienda del casero
(`app/casero/vivienda/[id]/(tabs)/index.tsx`) a partir de un mockup HTML/Tailwind.
Toda la lógica de negocio (biometría, expulsión, edición, eliminación de habitaciones,
compartir códigos) se mantuvo intacta.

---

## Cambios

### `frontend/app/casero/vivienda/[id]/(tabs)/index.tsx`

- Añadido import `Ionicons` de `@expo/vector-icons`; eliminado import `Card` (sustituido por `View` con estilos propios)
- Añadido sub-componente `AvatarInitials` — círculo con iniciales del inquilino,
  fondo `primary`, texto `surface`, tamaño configurable (default 36 px)
- Añadida constante `HAB_ICONS` — mapea tipo de habitación a nombre de icono Ionicons
  (`DORMITORIO→bed-outline`, `BANO→water-outline`, `COCINA→restaurant-outline`,
  `SALON→tv-outline`, `OTRO→grid-outline`)
- **Header card** — tarjeta blanca (`borderRadius 24`) con `alias_nombre`,
  `dirección` y chips de conteo (habitaciones en azul, inquilinos en verde esmeralda)
- **Accesos rápidos** — grid 2 columnas con botones Incidencias (icono naranja)
  y Tablón (icono primario) que navegan a los tabs correspondientes
- **Cards de habitación** — fila superior con `habIconBox` (tipo de habitación)
  a la izquierda y nombre de inquilino + `AvatarInitials` a la derecha (tappable
  → perfil del inquilino); botón "EXPULSAR" rojo pequeño separado por borde al
  fondo de la sección del inquilino
- **Código de invitación** — estado oculto rediseñado: Pressable en fila con
  `lock-closed-outline` y texto "Toca para revelar" (sustituye `codigoOculto`
  como texto `••••••••`)
- Eliminado FAB flotante (`position: absolute`); sustituido por
  `CustomButton variant="outline"` al final del scroll

### `frontend/styles/casero/vivienda/detalle.styles.ts`

Reescritura completa:

| Eliminado | Añadido |
|---|---|
| `title`, `address` | `headerCard`, `headerNombre`, `headerDireccion` |
| `cardHeader`, `cardTitle`, `cardTipo` | `headerChips`, `chipHabitaciones*`, `chipInquilinos*` |
| `inquilinoInfo`, `inquilinoTextos`, `inquilinoNombre`, `inquilinoEmail` | `accionesGrid`, `accionBtn`, `accionBtnPressed`, `accionIconIncidencias`, `accionIconTablon`, `accionLabel` |
| `codigoOculto` (text `••••`) | `seccionTitulo` |
| `fab`, `fabText`, `fabPressed` | `habCard`, `habCardTop`, `habLeft`, `habIconBox`, `habNombre`, `habTipo` |
| | `habInquilinoRight`, `habInquilinoNombre`, `sinInquilino` (restyled) |
| | `codigoOcultoBtn` (fila con icono candado) |
| | `expulsarFila`, `expulsarTexto` |
| | `botonAnadir` |

Mantenidos sin cambios funcionales: `codigoContainer`, `codigoLabel`, `codigo`,
`codigoHint`, `codigoReveladoFila`, `codigoReveladoTextoArea`, `revelarTexto`,
`incidenciasHabitacion`, `incidenciaFila`, `incidenciaDot`, `incidenciaTitulo`,
`accionFila`, `enlacePressed`, `errorTexto`, `container`, `content`

---

## Decisiones técnicas

- **Sub-componente local vs. compartido**: `AvatarInitials` se define localmente para
  mantener la independencia del archivo y evitar modificar componentes comunes sin un
  issue específico.
- **FAB → CustomButton outline**: el mockup muestra el botón "Añadir habitación" dentro
  del scroll. Esto elimina la superposición con el contenido y es más accesible.
- **Chips de conteo dinámicos**: `numInquilinos` se calcula con `filter(h => h.inquilino !== null).length`
  en tiempo de render, sin estado adicional.
- **Quick actions con `router.push`**: los botones Incidencias y Tablón navegan al path
  del tab correspondiente (`/casero/vivienda/${id}/incidencias`). Expo Router resuelve
  el grupo `(tabs)` correctamente desde paths sin el prefijo del grupo.
- **Email eliminado de la card**: el email del inquilino ya es accesible desde la
  pantalla de perfil (`/casero/inquilino/[id]`), implementada en el issue #111. Mostrarlo
  en la card provocaba truncado visual. El avatar actúa como enlace al perfil completo.
