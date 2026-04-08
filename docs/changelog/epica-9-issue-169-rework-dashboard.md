# Issue #169 — Rework de Navegación y Dashboard

**Fecha:** 2026-04-07
**Épica:** 9

## Qué se hizo

### Tab bars (casero y inquilino)
- Eliminado el borde duro superior (`borderTopWidth: 1`) en ambos `_layout.tsx`
- Añadida sombra suave hacia arriba (`shadowOffset: { width: 0, height: -3 }`, `shadowOpacity: 0.07`, `shadowRadius: 12`) para dar profundidad sin línea dura
- `elevation: 12` en Android para reforzar el efecto de elevación flotante
- Color activo ya apuntaba a `Theme.colors.primary` (coral) — ahora se percibe correctamente con la nueva paleta del issue #168

### Dashboard Inquilino — `inicio.styles.ts`
- `dashboardContent`: padding horizontal aumentado a `Theme.spacing.lg` (24); padding superior también a `lg`
- `greeting.marginBottom`: de 28 a `Theme.spacing.xl` (32) — más breathing room
- Nuevo estilo `greetingViviendaPill`: chip pill de color primary tintado (`primary + '18'`) con icono home y nombre de vivienda — reemplaza el subtítulo plano `vivienda · habitación`
- `greetingSubtitulo`: ahora muestra solo el nombre de la habitación, más limpio y personal
- `botonCanjear` (onboarding): `borderRadius` actualizado a `Theme.radius.lg` (24), añadido `minHeight: 52`
- `zonaRow`: `borderRadius` de `Theme.radius.md` (16) a `Theme.radius.lg` (24); `shadowRadius` de 3 a 8
- `zonaIconBox`: `borderRadius` de `Theme.radius.sm` (8) a `Theme.radius.md` (16); tint de fondo `primary + '15'`
- `incidenciaCard`: `borderRadius` de `Theme.radius.md` (16) a `Theme.radius.lg` (24); padding a `Theme.spacing.base` (16); `shadowOffset.height` de 2 a 3; `shadowRadius` de 6 a 10; `elevation` de 2 a 3
- `incidenciaTitulo`: `fontSize` de `body + 2` (17) a `Theme.typography.subtitle` (18) — token explícito
- `estadoBadge`: `borderRadius` de `Theme.radius.sm` a `Theme.radius.full` — pill completamente redondo
- `estadoPill` selector: `borderRadius` de `Theme.radius.sm` a `Theme.radius.full`
- `botonReportar`: `borderWidth` de 1.5 a 2; `borderRadius` de `md` a `lg`; `minHeight: 52`
- `fab`: `backgroundColor` cambiado de `danger` a `primary`; `shadowColor` cambiado a `primary` para sombra de color; `fabPressed` añade `scale: 0.95`

### Dashboard Inquilino — `inicio.tsx`
- `AvatarInitials`: fondo de `#E5E5EA` (gris frío) a `Theme.colors.primary + '22'` (coral tintado cálido); texto de `Theme.colors.text` a `Theme.colors.primary`; `shadowRadius` de 3 a 6; `fontWeight` de `'600'` a `'700'`; tamaño de fuente de `size * 0.3` a `size * 0.32`
- Sección saludo: reemplazada línea `vivienda · habitación` por el subtítulo solo con habitación + pill `greetingViviendaPill` que muestra icono home y nombre de vivienda

### Dashboard Casero — `viviendas.styles.ts`
- `list`: `padding` fijo de 16 → `paddingHorizontal: lg` (24), `paddingTop: lg` (24) — breathing room real
- `headerTitulo`: `fontSize` de 28 a 32; `fontWeight` ya en `'800'`
- `cardWrapperPressed`: añade `transform: [{ scale: 0.985 }]` además de opacity — press feedback más nativo
- `cardImagePlaceholder`: `height` de 120 a 110; `backgroundColor` de `primary + '1A'` a `primary + '15'` — tint más limpio
- `chipHabitaciones.backgroundColor`: de `#EFF6FF` hardcodeado a `Theme.colors.primary + '18'` (coral tintado)
- `chipHabitaciones.color` texto: de `#1D4ED8` hardcodeado a `Theme.colors.primary`
- `chipInquilinos.backgroundColor`: de `#ECFDF5` hardcodeado a `Theme.colors.success + '18'` (teal tintado)
- `chipInquilinos.color` texto: de `#065F46` hardcodeado a `Theme.colors.success`
- Chips: `paddingVertical` de 4 a 5; `borderRadius` ya en `Theme.radius.full` (100)
- `emptyContainer.paddingVertical`: de 48 (número mágico) a `Theme.spacing.xxl` (48) — tokenizado
- Nuevo estilo `emptyIconBox`: contenedor 96×96, `borderRadius: Theme.radius.xl` (32), `backgroundColor: primary + '15'` — enmarca el icono de forma cálida y acogedora
- `emptyTitulo`: `fontWeight` de `'700'` a `'800'`; añadido `letterSpacing: -0.3`
- `emptySubtitulo`: `lineHeight` de 22 a 24
- `fab`: `borderRadius` de 32 (número mágico) a `Theme.radius.full`; `paddingHorizontal` de 20 a `Theme.spacing.lg` (24); `shadowColor` de `shadow` a `primary` (sombra de color); `fabPressed` añade `scale: 0.96`

### Dashboard Casero — `viviendas.tsx`
- `ListEmptyComponent`: estructura renovada — icono dentro de `emptyIconBox` pill, título cambiado a `"¡Añade tu primera vivienda!"`, subtítulo más invitador y descriptivo, botón cambiado de `"Comenzar"` a `"Crear vivienda"`
- Chip iconos: `color` de `"#1D4ED8"` / `"#065F46"` hardcodeados a `Theme.colors.primary` / `Theme.colors.success`
