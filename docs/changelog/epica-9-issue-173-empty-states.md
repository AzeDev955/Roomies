# Issue #173 — Estados Vacíos / Empty States

**Fecha:** 2026-04-07
**Épica:** 9

## Qué se hizo

### Inventario de empty states encontrados y corregidos

| Pantalla | Estado vacío | Tipo | CTA |
|---|---|---|---|
| `casero/(tabs)/tablon.tsx` — sin vivienda | Texto plano | Bloqueante contextual | No (ir a crear vivienda está en otra tab) |
| `casero/(tabs)/tablon.tsx` — ListEmpty | Texto plano | Feed vacío | Sí (FAB ya visible) |
| `casero/vivienda/[id]/(tabs)/tablon.tsx` — ListEmpty | Texto plano | Feed vacío | Sí (FAB) |
| `inquilino/(tabs)/tablon.tsx` — sin vivienda | Texto plano | Bloqueante contextual | No |
| `inquilino/(tabs)/tablon.tsx` — ListEmpty | Texto plano | Feed vacío | Sí (FAB) |
| `inquilino/(tabs)/inicio.tsx` — incidencias activas | Texto plano | Estado positivo | No |
| `inquilino/(tabs)/limpieza.tsx` — sin turnos | Texto plano | Contextual | No |
| `casero/vivienda/[id]/(tabs)/limpieza.tsx` — sin zonas | Texto plano + CTA | Con acción | Sí (generar zonas) |
| `casero/vivienda/[id]/(tabs)/limpieza.tsx` — sin turnos | Texto plano + CTA | Con acción | Sí (generar turnos) |
| `casero/vivienda/[id]/(tabs)/limpieza.tsx` — sin inquilinos (modal) | Texto plano | Contextual inline | No |

---

### Patrón aplicado (consistente en toda la app)

Todos los empty states de pantalla completa siguen este patrón:

```
<View style={emptyContainer}>         ← gap: md, alignItems: center, paddingTop: xxl
  <View style={emptyIconBox}>          ← 80×80 o 88×88, borderRadius: xl, backgroundColor: color + '15'/'18'
    <Ionicons name="..." size={40-44} color={Theme.colors.primary | success} />
  </View>
  <Text style={emptyTitulo}>          ← fontWeight: '800', fontSize: title/heading
  <Text style={emptySubtitulo}>       ← color: textSecondary, lineHeight: 24
  [<CustomButton>]                     ← solo si el usuario puede crear el contenido
</View>
```

---

### Archivos de estilos actualizados

**`frontend/styles/casero/vivienda/limpieza.styles.ts`:**
- `content`: de `padding: base` a `paddingHorizontal: lg + paddingTop: base` — breathing room
- Eliminado `emptyText` (texto plano legacy)
- `emptyContainer`: `paddingTop: xl` → `xxl`; añadido `gap: md`
- Nuevos estilos: `emptyIconBox`, `emptyTitulo`, `emptySubtitulo` — mismo patrón que el resto del sistema

---

### Archivos de componentes actualizados

**`frontend/app/casero/(tabs)/tablon.tsx`:**
- Rewrite completo para sincronizarlo con el patrón establecido en `tablon/[viviendaId].tsx` (issue #170)
- Empty state sin-vivienda: icono `home-outline` + título + subtítulo
- ListEmptyComponent: icono `megaphone-outline` + "¡Rompe el hielo!" + subtítulo
- FAB: `<Text>+</Text>` → `<Ionicons name="add" size={28} />` + `accessibilityLabel`
- `eliminarBtn`: `<Text>✕</Text>` → pill (`styles.eliminarBtn` + `styles.eliminarBtnTexto`)
- `cardAutorRow` + `cardAutorDot` + nuevo renderAnuncio con footer con separador
- Focus states en inputs del modal (estado `tituloFocused`/`contenidoFocused`)
- `placeholderTextColor`: `"#9e9e9e"` → `Theme.colors.textMuted`
- `ActivityIndicator color="#fff"` → `Theme.colors.surface`
- Backdrop del modal: añadido `<Pressable onPress={cerrarModal} />` para cerrar tocando fuera
- Añadido `modalHandle`

**`frontend/app/casero/vivienda/[id]/(tabs)/tablon.tsx`:**
- Mismo rewrite — todos los patrones de `tablon/[viviendaId].tsx` aplicados
- ListEmptyComponent: icono + título + subtítulo
- Resto: FAB con Ionicons, eliminarBtn pill, cardAutorRow, focus states, tokenizado

**`frontend/app/inquilino/(tabs)/tablon.tsx`:**
- Mismo rewrite
- Empty state sin-vivienda: icono `key-outline` + "Únete a una vivienda" + contexto explicativo
- ListEmptyComponent: icono `megaphone-outline` + "¡Rompe el hielo!" + subtítulo
- Resto: mismo patrón completo

**`frontend/app/inquilino/(tabs)/inicio.tsx`:**
- Sección incidencias activas vacías: `<Text style={styles.emptyText}>` → componente inline con icono `checkmark-circle-outline` (verde), título "¡Todo tranquilo!" y subtítulo amigable

**`frontend/app/inquilino/(tabs)/limpieza.tsx`:**
- `turnos.length === 0`: `emptyText` plano → contenedor con icono `sparkles-outline` (primary), título "Sin tareas esta semana" y subtítulo contextual

**`frontend/app/casero/vivienda/[id]/(tabs)/limpieza.tsx`:**
- `emptyComponent` (sin zonas): añadido `emptyIconBox` con `sparkles-outline` (success) + `emptyTitulo` + `emptySubtitulo` antes del `CustomButton`
- Turno vacío en calendario: misma estructura con icono `calendar-outline` (success)
- Inquilinos vacíos en modal: texto plano tokenizado y con `paddingVertical`
- `AvatarInitials.backgroundColor`: de `'#E8E8E8'` hardcodeado a `Theme.colors.primary + '22'`; color del texto de `textMedium` a `primary`

---

### Iconos utilizados por contexto

| Contexto | Icono | Color |
|---|---|---|
| Sin vivienda (casero) | `home-outline` | primary |
| Sin vivienda (inquilino) | `key-outline` | primary |
| Tablón vacío | `megaphone-outline` | primary |
| Incidencias activas vacías | `checkmark-circle-outline` | success |
| Sin turnos de limpieza | `sparkles-outline` / `calendar-outline` | success / primary |
| Sin zonas de limpieza | `sparkles-outline` | success |
