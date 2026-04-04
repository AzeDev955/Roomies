# Épica 7 — Rediseño Visual: Centro de Mando del Casero (Detalle de Vivienda)

**Fecha:** 2026-04-04  
**Rama:** refactor/refactorizacion-visual  
**Archivos modificados:** 2

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
