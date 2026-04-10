# Issue #172 — Rework de Formularios y Modales

**Fecha:** 2026-04-07
**Épica:** 9

## Qué se hizo

### `frontend/styles/index.styles.ts` (Login)

- `subtitulo.marginBottom`: de 40 (número mágico) a `Theme.spacing.xxl` (48) — tokenizado
- `botonGoogle.borderRadius`: de `md` (16) a `lg` (24) — forma más suave
- `botonGoogle.borderWidth`: de 1.5 a 2 — borde más limpio y visible
- `botonGoogle.shadowRadius`: de 3 a 8; `shadowOffset.height` de 1 a 2 — sombra más suave
- `botonGoogle.minHeight`: añadido 52 — touch target mínimo Apple HIG
- `separador.marginTop`: de 20 (número mágico) a `Theme.spacing.lg` (24) — tokenizado
- `enlaceRegistroTexto.fontSize`: de 14 (número mágico) a `Theme.typography.label` (14) — tokenizado; añadido `fontWeight: '500'`
- `pressed`: añade `transform: [{ scale: 0.97 }]` — scale feedback nativo

### `frontend/styles/registro.styles.ts` (Registro)

- `container.paddingTop`: de 48 a `Theme.spacing.xxl` (48) — tokenizado
- `container.paddingBottom`: de 40 a `Theme.spacing.xxl` (48) — tokenizado
- `titulo.fontSize`: de 28 (número mágico) a `Theme.typography.heading` (24) — tokenizado; más proporcional al espacio
- `subtitulo.marginBottom`: de 36 a `Theme.spacing.xl` (32) — tokenizado
- `labelDoc`, `labelRol`: eliminados `textTransform: 'uppercase'` y `letterSpacing: 0.5`; color de `textSecondary` a `textMedium` — tono más amigable y menos rígido
- `docChip.borderRadius`: de `md` (16) a `full` (100) — pills auténticas y táctiles
- `docChip.borderWidth`: de 1.5 a 2; `paddingVertical`: de 10 a 12; añadido `minHeight: 44`; `backgroundColor`: de `surface2` a `surface`
- `rolPill.borderRadius`: de `md` (16) a `full` (100) — pills auténticas
- `rolPill.borderWidth`: de 1.5 a 2; añadido `minHeight: 52`; `backgroundColor`: de `surface` explícito (sin cambio funcional, tokenizado)
- `rolPillTexto.color`: de `textTertiary` a `textMedium` — más legible en estado inactivo
- `errorTexto`: añadido `fontWeight: '500'` — mensajes de error más legibles sin ser agresivos
- `enlaceLoginTexto`: tokenizado `fontSize: 14` → `label`; añadido `fontWeight: '500'`
- `botonGoogle`: mismos cambios que en login — `borderRadius: lg`, `borderWidth: 2`, `minHeight: 52`, `shadowRadius: 8`
- `separador.marginTop`: de 20 a `Theme.spacing.lg` — tokenizado
- `pressed`: añade `transform: [{ scale: 0.97 }]`

### `frontend/styles/casero/nueva-vivienda.styles.ts` (Nueva Vivienda)

- `scrollContent`: de `padding: base` (16 en todo) a `paddingHorizontal: lg` (24) + `paddingTop: base` + `paddingBottom: xxl` — breathing room real
- `label`: eliminados `textTransform: 'uppercase'` y `letterSpacing: 0.5`; color de `textSecondary` a `textMedium`; `marginTop: base` → `base` (sin cambio funcional)
- `labelSeccion`: `letterSpacing` de 0.5 a 0.8 — más distinguible como separador de sección
- `input`: añadido `borderWidth: 2`, `borderColor: border`; `shadowRadius: 2` → 6; `minHeight: 52`
- `buscadorInput`: ídem a `input`
- `buscadorBoton.borderRadius`: de `md` a `lg`; añadido `minWidth: 80`, `minHeight: 52`
- `resultadosContainer.borderRadius`: de `md` a `lg`; `shadowRadius: 4` → 12; `elevation: 3` → 4
- `resultadoItem.borderBottomColor`: de `'#f0f0f0'` hardcodeado a `Theme.colors.border`
- `resultadoTexto.fontSize`: de 14 a `Theme.typography.label` — tokenizado
- `tipoPill.borderRadius`: de `lg` (24) a `full` (100) — pills auténticas como el resto del sistema
- `tipoPill`: añadido `borderWidth: 2`, `borderColor: transparent`, `minHeight: 40`
- `tipoPillActivo`: cambiado de `backgroundColor: primary` (sólido) a `primary + '18'` + `borderColor: primary` — consistente con soft tint del sistema; `tipoPillTextoActivo`: de `surface` (blanco) a `primary`
- `switchFila.borderRadius`: de `md` (16) a `lg` (24); añadido `borderWidth: 2`, `borderColor: border`; eliminadas sombras (redundante con el borde)
- `switchLabel.fontSize`: de 14 a `Theme.typography.label` — tokenizado
- `botonAnadirHabitacion.borderRadius`: de `md` a `lg`; `paddingVertical: md` → 14; añadido `minHeight: 52`
- `habitacionItem.borderRadius`: de `md` a `lg`; `shadowRadius: 2` → 6
- `habitacionItemEliminar`: de fondo `danger` sólido (32×32 square) a círculo soft tint — `backgroundColor: danger + '18'`, `borderColor: danger + '40'`, `borderWidth: 1.5`, `borderRadius: full`, `width/height: 32`
- `habitacionItemEliminarTexto.color`: de `surface` (blanco) a `danger` — consistente con el diseño soft
- `boton.borderRadius`: de `md` a `lg`; `paddingVertical: base` → 16; añadido `minHeight: 52`

### `frontend/app/casero/nueva-vivienda.tsx` (Nueva Vivienda)

- Importado `Theme` de `@/constants/theme`
- Todos los `placeholderTextColor="#9e9e9e"` → `Theme.colors.textMuted` (6 ocurrencias) — tokenizado
- `Switch.trackColor`: de `{ false: '#dee2e6', true: '#34C759' }` hardcodeado a `{ false: Theme.colors.border, true: Theme.colors.success }` — tokenizado

### `frontend/styles/rol.styles.ts` (Selector de Rol)

- `titulo.fontSize`: de 26 a `Theme.typography.heading` (24) — tokenizado; añadido `letterSpacing: -0.3`
- `subtitulo.lineHeight`: de 22 a 24
- `card.borderRadius`: de 16 (número mágico) a `Theme.radius.lg` (24) — tokenizado
- `card`: añadido `borderWidth: 2`, `borderColor: transparent` por defecto — preparado para el estado activo con borde
- `card.shadowRadius`: de 6 a 10; `shadowOffset.height` de 2 a 3
- `cardActivo`: antes solo `borderWidth + borderColor`; ahora añade `backgroundColor: primaryLight` — feedback visual cálido al seleccionar
- `cardTitulo.fontSize`: de 18 a `Theme.typography.subtitle` (18) — tokenizado
- `cardDescripcion.lineHeight`: de 18 a 20
- `botonConfirmar.borderRadius`: de `md` (16) a `lg` (24); `paddingVertical: base` → 16; añadido `minHeight: 52`
- `botonConfirmarTexto.fontSize`: de 17 (número mágico) a `typography.subtitle` (18) — tokenizado

### `frontend/styles/inquilino/limpieza.styles.ts` (Limpieza)

- `content`: de `padding: base` a `paddingHorizontal: lg` + `paddingTop: lg` + `paddingBottom: xxl`
- `emptyContainer.paddingVertical`: de `xl` (32) a `xxl` (48)
- `emptyText.lineHeight`: de 22 a 24
- `header.marginBottom`: de `lg + 4` (28) a `xl` (32) — tokenizado
- `headerSemana.fontSize`: de 11 a `caption` (12) — tokenizado
- `headerSubtitulo.fontSize`: de 15 a `body` (15) — tokenizado; añadido `lineHeight: 22`
- `seccionTitulo.fontSize`: de 17 a `subtitle` (18) — tokenizado
- `miTareaVacia.borderRadius`: de 20 a `Theme.radius.lg` (24); añadidas sombras suaves
- `miTareaVaciaTexto.lineHeight`: de ausente a 22
- `miTareaCard.borderRadius`: de 24 (número mágico) a `Theme.radius.lg` (24) — tokenizado
- `miTareaCard.shadowOffset.height`: de 2 a 3; `shadowRadius` de 8 a 10
- `miTareaIconBox.borderRadius`: de 16 a `Theme.radius.md` (16) — tokenizado; `backgroundColor: primary + '0D'` → `primary + '15'`
- `miTareaIconBoxHecha.backgroundColor`: de `'#E1F5E8'` a `'#E5FAF3'` — consistente con el soft tint del sistema
- `botonHecho.borderRadius`: de 16 (número mágico) a `Theme.radius.full` (100); añadido `minHeight: 52`
- `botonHechoPressed`: añade `transform: [{ scale: 0.97 }]`
- `badgeHecho.borderRadius`: de 12 a `Theme.radius.md` (16) — tokenizado; `backgroundColor: '#E1F5E8'` → `'#E5FAF3'`
- `badgeHechoTexto.color`: de `'#248A3D'` a `'#0D7A5E'` — consistente con el soft tint de `RESUELTA`
- `companeroRow.borderRadius`: de 16 (número mágico) a `Theme.radius.lg` (24) — tokenizado; `shadowRadius` de 4 a 8
- `companeroEstadoHecho.color`: de `'#248A3D'` a `'#0D7A5E'` — consistente con el sistema

### `frontend/app/inquilino/(tabs)/limpieza.tsx` (Limpieza)

- `AvatarInitials.backgroundColor`: de `'#EAF0FF'` hardcodeado a `Theme.colors.primary + '22'` — tokenizado y consistente con el resto de avatares en la app (patrón issue #169)
