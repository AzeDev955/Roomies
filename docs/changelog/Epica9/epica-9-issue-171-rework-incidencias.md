# Issue #171 — Rework del Módulo de Incidencias

**Fecha:** 2026-04-07
**Épica:** 9

## Qué se hizo

### Sistema de colores soft tints (nuevo, compartido entre ambas pantallas)

Introducido en ambos archivos de estilos (`incidencias.styles.ts` y `detalle.styles.ts`):

**Prioridad (soft tints):**
| Nivel | Fondo | Texto |
|---|---|---|
| VERDE (Baja) | `#E5FAF3` (verde menta pálido) | `#0D7A5E` (verde oscuro accesible) |
| AMARILLO (Media) | `#FFF5E0` (amarillo pálido cálido) | `#A05C00` (ámbar oscuro accesible) |
| ROJO (Alta) | `#FFE8E8` (rosa pálido) | `#C0392B` (rojo oscuro accesible) |

**Estado (soft tints para pills activas):**
| Estado | Fondo activo | Texto activo |
|---|---|---|
| PENDIENTE | `#FFF5E0` | `#A05C00` |
| EN_PROCESO | `primary + '20'` (coral muy tintado) | `Theme.colors.primary` |
| RESUELTA | `#E5FAF3` | `#0D7A5E` |

Todos los pares de color verifican contraste ≥ 4.5:1 (WCAG AA).

---

### `frontend/styles/casero/vivienda/incidencias.styles.ts`

- Exportados nuevos mapas: `PRIORIDAD_BG`, `PRIORIDAD_TEXT`, `ETIQUETAS_PRIORIDAD`, `ESTADO_PILL_BG`, `ESTADO_PILL_TEXT`
- `content`: padding fijo → `paddingHorizontal: lg` (24) + `paddingTop: lg` — breathing room
- `card`: reestructurado — ahora `overflow: 'hidden'` para contener el stripe; `borderRadius: lg` (24); `shadowRadius` de 4 a 10; `elevation` de 2 a 3; sin padding propio (lo tiene `cardBody`)
- Nuevo `cardStripe`: barra de 4px de alto en la parte superior de la card con el color sólido de prioridad — reemplaza el `indicador` cuadrado anterior
- `cardBody`: padding de `base` (16)
- Nuevo `cardTopRow`: fila título + badge de prioridad
- `cardTitulo.fontSize`: de `body` (15) a `subtitle` (18); añadido `lineHeight: 24`
- Nuevo `prioridadBadge` + `prioridadBadgeTexto`: pill pill de soft tint por prioridad en la esquina superior derecha de la card
- `cardDescripcion.marginBottom`: de `sm` a `md` — más respiración
- `estadoSelector`: añadido `borderTopWidth: 1` + `borderTopColor: border` + `paddingTop: sm` — separador visual del footer
- `estadoPill`: `borderRadius` de `sm` a `full`; `paddingVertical` de 6 a 8; `minHeight: 36`; colores activos por estado (no más un único `primary` para todos)
- Eliminado `estadoPillActivo` (style único) — sustituido por lógica de color por estado en el componente
- Empty state: reemplazado `emptyText` plano por `emptyContainer` + `emptyIconBox` + `emptyTitulo` + `emptySubtitulo`

### `frontend/app/casero/vivienda/[id]/(tabs)/incidencias.tsx`

- Importados `PRIORIDAD_BG`, `PRIORIDAD_TEXT`, `ETIQUETAS_PRIORIDAD`, `ESTADO_PILL_BG`, `ESTADO_PILL_TEXT` del styles
- Importado `Ionicons` para el empty state icon
- `renderCard`: estructura renovada — stripe de color arriba, badge de prioridad (soft tint) en `cardTopRow`, pills de estado con colores por estado
- `ListEmptyComponent`: reemplazado texto plano por componente completo con icono `checkmark-circle-outline` + título "Todo en orden" + subtítulo invitador
- Añadido `showsVerticalScrollIndicator={false}` al `FlatList`

---

### `frontend/styles/incidencia/detalle.styles.ts`

- Exportados nuevos mapas: `PRIORIDAD_BG`, `PRIORIDAD_TEXT`, `ESTADO_PILL_BG`, `ESTADO_PILL_TEXT`
- `content`: padding → `paddingHorizontal: lg` (24) + `paddingTop: lg` + `paddingBottom: xxl`
- **Cabecera rediseñada** como hero card del ticket:
  - Eliminados `cabecera`, `dot`, `cabeceraTextos` (estructura antigua)
  - Nuevo `cabeceraCard`: card elevada con `borderRadius: lg`, shadow suave
  - Nuevo `cabeceraStripe`: barra de color de prioridad (40px ancho, 4px alto, `borderRadius: full`) — indicador sutil en la parte superior
  - Nuevo `cabeceraBadgeRow` + `prioridadBadge` + `prioridadBadgeTexto`: pill soft tint de prioridad
  - `titulo.fontSize`: de `title` (20) a `heading` (24); `fontWeight: '800'`; `letterSpacing: -0.5`; `lineHeight: 32`
  - `subtitulo`: muestra "Reportada el [fecha larga]" — contexto más claro
- `seccion`: `borderRadius` de `md` (16) a `lg` (24); padding de `base` a `lg`; `shadowRadius` de 3 a 8; `elevation` de 1 a 2
- `etiqueta`: `fontSize` de 11 a `caption` (12) — tokenizado; `letterSpacing` de 0 a 0.8; `marginBottom: sm`
- `valor.fontSize`: de 14 a `body` (15); `lineHeight` de 20 a 24
- `inputTexto`: `borderWidth` de 1 a 2; `borderColor` fijo → `primary`; `backgroundColor` → `primaryLight`; `borderRadius` de `sm` a `md`; `padding` → `base` (tokenizado); `lineHeight: 22`
- **Estado pills rediseñadas**: `borderRadius: full`; `paddingVertical: 12`; `minHeight: 44` (touch target); `borderWidth: 2`; `borderColor: transparent` por defecto → color tintado cuando activo; colores por estado en lugar de único `primary`
- **Botones de acción rediseñados**:
  - Todos: `borderRadius: lg` (24); `minHeight: 52`; `paddingVertical: 14`
  - `botonEliminar`: cambio radical — de fondo `danger` sólido a `danger + '18'` (soft tint) con `borderColor: danger + '40'`; texto `botonTextoEliminar` con `color: danger` — acción destructiva visible pero no agresiva
  - Nuevo `botonTextoEliminar` para el texto del botón eliminar
  - `botonCancelar`: añadido `borderWidth: 2`, `borderColor: border`

### `frontend/app/incidencia/[id].tsx`

- Importados `PRIORIDAD_BG`, `PRIORIDAD_TEXT`, `ESTADO_PILL_BG`, `ESTADO_PILL_TEXT`
- Cabecera: reemplazada la estructura antigua (`dot` + textos) por `cabeceraCard` con `cabeceraStripe`, `prioridadBadge`, `titulo`, `subtitulo` con fecha larga
- Selector de estado: pills con colores por estado (activo → `ESTADO_PILL_BG[e]` + `borderColor` tintado)
- Botón Eliminar: usa `botonTextoEliminar` (texto en rojo) en lugar de `botonTextoClaro` (blanco)
- `formatearFecha`: `month: '2-digit'` → `month: 'long'` — fecha más legible en el detalle
- Todos los `Pressable` de acciones tienen `({ pressed }) => [style, pressed && { opacity }]` — press feedback
- Añadido `showsVerticalScrollIndicator={false}` al `ScrollView`
