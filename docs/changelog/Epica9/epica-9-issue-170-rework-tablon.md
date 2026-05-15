# Issue #170 — Rework del Tablón de Anuncios

**Fecha:** 2026-04-07
**Épica:** 9

## Qué se hizo

### `frontend/styles/tablon/tablon.styles.ts`

**Feed de anuncios:**
- `content`: padding fijo de 16 → `paddingHorizontal: lg` (24) + `paddingTop: lg` (24) — breathing room real
- `card.borderRadius`: de `Theme.radius.md` (16) a `Theme.radius.lg` (24) — tarjetas más suaves
- `card.padding`: de `Theme.spacing.base` (16) a `Theme.spacing.lg` (24) — interior generoso
- `card.shadowOffset.height`: de 2 a 3; `shadowRadius` de 4 a 10 — sombra más suave y difusa
- `card.elevation`: de 2 a 3
- `cardTitulo.fontSize`: de `body` (15) a `subtitle` (18) — más jerarquía; `fontWeight` de `'600'` a `'700'`; añadido `lineHeight: 24`
- `cardContenido.fontSize`: de 14 (número mágico) a `Theme.typography.body` (15) — tokenizado; `lineHeight` de 20 a 24 — lectura más holgada
- `cardFooter`: añadido `borderTopWidth: 1`, `borderTopColor: border`, `paddingTop: sm` — separador sutil entre contenido y firma
- Nuevo `cardAutorRow`: fila con dot + nombre del autor
- Nuevo `cardAutorDot`: círculo de 8px con `backgroundColor: primary` — indicador visual de autoría
- `cardAutor.fontSize`: de `caption` (12) a `label` (14); `fontWeight` de `'600'` a `'700'`; `color` de `primary` a `text` — nombre más prominente sin saturar
- `eliminarBtn`: convertido de texto plano a círculo 28×28 (`borderRadius: full`, `backgroundColor: surface2`) — botón sutil e integrado
- Nuevo `eliminarBtnTexto`: `fontSize: 12`, `color: textTertiary`, `fontWeight: '700'`

**Empty state — reemplazo completo:**
- Eliminado `emptyText` (texto plano genérico)
- Nuevos estilos `emptyContainer`, `emptyIconBox`, `emptyTitulo`, `emptySubtitulo`
- `emptyIconBox`: 88×88, `borderRadius: xl` (32), `backgroundColor: primary + '15'`

**FAB:**
- `shadowColor`: de `shadow` (negro) a `primary` (coral) — sombra de color
- `shadowOpacity`: de 0.3 a 0.4; `shadowRadius` de 4 a 8 — más difusa
- `fabPressed`: añade `transform: [{ scale: 0.95 }]` — scale feedback

**Modal (bottom sheet):**
- `modalContainer.borderTopLeftRadius` / `borderTopRightRadius`: de `Theme.radius.lg` (24) a `Theme.radius.xl` (32) — esquinas superiores más redondeadas
- `modalContainer.paddingTop`: de `lg` (24) a `xl` (32) — más espacio interno
- `modalContainer.paddingBottom`: de 36 a 40
- Nuevo `modalHandle`: barra de 40×4px centrada en la parte superior — indicador visual de bottom sheet arrastrable
- `modalTitulo.fontSize`: de 18 (número mágico) a `Theme.typography.title` (20) — tokenizado; `fontWeight` de `'700'` a `'800'`; añadido `letterSpacing: -0.3`
- `inputTitulo`: `borderRadius` de 10 (número mágico) a `Theme.radius.md` (16); añadido `borderWidth: 2`, `borderColor: border`; `paddingHorizontal/Vertical` tokenizados; `minHeight: 52`
- `inputContenido`: mismo rework que `inputTitulo`; `height` de 120 a 130; `lineHeight` de 20 a 22
- `botonCancelar`: `borderWidth` de 1.5 a 2; `borderRadius` de `md` a `lg`; añadido `minHeight: 52`
- `botonPublicar`: `borderRadius` de `md` a `lg`; añadido `minHeight: 52`
- `botonPressed`: añade `transform: [{ scale: 0.97 }]`

### `frontend/app/tablon/[viviendaId].tsx`

- Importado `Ionicons` de `@expo/vector-icons`
- FAB: reemplazado `<Text style={styles.fabTexto}>+</Text>` por `<Ionicons name="add" size={28} />` — icono vectorial; añadido `accessibilityLabel` + `accessibilityRole`
- `eliminarBtn`: `<Text style={styles.eliminarBtn}>✕</Text>` → `<View style={styles.eliminarBtn}><Text style={styles.eliminarBtnTexto}>✕</Text></View>` — estructura para el círculo; añadido `accessibilityLabel` + `accessibilityRole`
- Footer de la tarjeta: reemplazado `<Text style={styles.cardAutor}>` por `<View style={styles.cardAutorRow}><View style={styles.cardAutorDot} /><Text style={styles.cardAutor}>` — dot indicator visual
- `ListEmptyComponent`: de `<Text>` plano a componente con `emptyIconBox` + icono `megaphone-outline` + `emptyTitulo` + `emptySubtitulo`
- Modal inputs: añadidos estados `tituloFocused` / `contenidoFocused` con `onFocus/onBlur` para aplicar `borderColor: primary` + `backgroundColor: primaryLight` — focus states amigables consistentes con el sistema
- `placeholderTextColor`: de `"#9e9e9e"` hardcodeado a `Theme.colors.textMuted` — tokenizado
- `ActivityIndicator` del botón Publicar: `color="#fff"` → `color={Theme.colors.surface}` — tokenizado
- Añadido `<Pressable style={{ flex: 1 }} onPress={cerrarModal} />` sobre el modal overlay — tap en el backdrop cierra el sheet
- Añadido `showsVerticalScrollIndicator={false}` al `FlatList`
