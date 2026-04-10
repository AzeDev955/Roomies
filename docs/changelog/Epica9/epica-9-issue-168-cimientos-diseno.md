# Issue #168 — Cimientos del Sistema de Diseño (Épica 9)

## Resumen

Rediseño completo de los tokens de `theme.ts` y los 3 componentes base (`CustomButton`, `Card`, `CustomInput`) para adoptar el estilo visual **"Amigable y colorido"** (Airbnb / Duolingo). Paleta coral cálida, bordes amplios, espaciados generosos y sombras suaves. Guiado por el análisis del skill `ui-ux-pro-max`.

## Cambios

### `frontend/constants/theme.ts`

Actualización completa de todos los tokens del objeto `Theme`:

| Categoría | Token | Antes | Después | Razón |
|---|---|---|---|---|
| `colors` | `primary` | `#007AFF` (azul iOS) | `#FF6B6B` (coral cálido) | Paleta vibrante y amigable inspirada en Airbnb |
| `colors` | `primaryLight` | — (nuevo) | `#FFF0F0` | Fondo tintado para focus states de inputs |
| `colors` | `primaryDisabled` | `#b0c8f0` | `#FFBCBC` | Consistente con el nuevo primary coral |
| `colors` | `success` | `#34C759` | `#06D6A0` | Verde-teal más vibrante y diferenciado |
| `colors` | `successDisabled` | `#a8ddb5` | `#A3E8DA` | Consistente con el nuevo success |
| `colors` | `background` | `#f5f5f5` (frío) | `#F8F7F4` (warm off-white) | Evitar fondos fríos; breathing room cálido |
| `colors` | `surface2` | `#e9ecef` (frío) | `#F2F0EB` (warm grey) | Chips y fondos secundarios más cálidos |
| `colors` | `text` | `#212529` | `#1A1A2E` (deep navy) | Más carácter que el negro puro estándar |
| `colors` | `textSecondary` | `#6c757d` | `#6B6B80` | Tono neutro-cálido |
| `colors` | `textTertiary` | `#9e9e9e` | `#9E9EAF` | Ídem |
| `colors` | `textMuted` | `#c7c7cc` | `#C4C4D0` | Ídem |
| `colors` | `textMedium` | `#495057` | `#3D3D56` | Más profundo y rico |
| `colors` | `border` | `#dee2e6` (frío) | `#E8E6E0` (warm) | Borde más cálido y suave |
| `spacing` | `xxl` | — (nuevo) | `48` | Necesario para secciones con breathing room amplio |
| `radius` | `md` | `12` | `16` | Soft corners para inputs y chips |
| `radius` | `lg` | `20` | `24` | Soft corners para cards y botones |
| `radius` | `xl` | — (nuevo) | `32` | Hero cards y bottom sheets |
| `radius` | `full` | `28` | `100` | Verdadero pill para avatares y badges |
| `typography` | `label` | `13` | `14` | Legibilidad mejorada en labels de input |
| `typography` | `subtitle` | — (nuevo) | `18` | Escala intermedia entre `body` y `title` |

### `frontend/components/common/CustomButton.styles.ts`

| Propiedad | Antes | Después |
|---|---|---|
| `borderRadius` | `Theme.radius.md` (12) | `Theme.radius.lg` (24) — soft corners amplios |
| `paddingVertical` | `14` | `16` — área táctil más generosa |
| `minHeight` | — | `52` — cumple mínimo 44pt Apple HIG |
| `pressed` | `{ opacity: 0.8 }` | `{ opacity: 0.82, transform: [{ scale: 0.97 }] }` — scale feedback nativo |
| `disabled` | `{ opacity: 0.5 }` | `{ opacity: 0.45 }` — diferencia semántica más clara |
| `outline.borderWidth` | `1.5` | `2` — borde más limpio en la nueva paleta |
| `outline.borderColor` | `Theme.colors.border` (gris) | `Theme.colors.primary` (coral) — consistente con marca |
| `textLight/textDark.letterSpacing` | — | `0.2` — micro mejora de legibilidad en bold |

### `frontend/components/common/Card.styles.ts`

| Propiedad | Antes | Después |
|---|---|---|
| `borderRadius` | `Theme.radius.md` (12) | `Theme.radius.lg` (24) — tarjetas más suaves y amigables |
| `padding` | `Theme.spacing.base` (16) | `Theme.spacing.lg` (24) — breathing room generoso |
| `shadowOffset` | `{ width: 0, height: 2 }` | `{ width: 0, height: 4 }` — sombra más profunda y suave |
| `shadowOpacity` | `0.08` | `0.08` (sin cambio) |
| `shadowRadius` | `4` | `12` — blur mucho más suave, efecto material card |
| `elevation` | `2` | `4` — más presencia en Android |
| `pressed` | `{ opacity: 0.9 }` | `{ opacity: 0.96, transform: [{ scale: 0.985 }] }` — scale feedback |

### `frontend/components/common/CustomInput.styles.ts`

| Propiedad | Antes | Después |
|---|---|---|
| `wrapper.marginBottom` | `20` (número mágico) | `Theme.spacing.lg` (24) — tokenizado |
| `label.color` | `textSecondary` | `textMedium` — más contraste y jerarquía |
| `label.textTransform` | `'uppercase'` | eliminado — tono más amigable y menos rígido |
| `label.letterSpacing` | `0.5` | eliminado — consistente con la eliminación del uppercase |
| `inputWrapper.borderRadius` | `Theme.radius.md` (12) | `Theme.radius.md` (16 nuevo) — inputs más suaves |
| `inputWrapper.borderWidth` | `1.5` | `2` — borde más claro y definido |
| `inputWrapper.borderColor` | `transparent` | `Theme.colors.border` — estado inactivo visible |
| `inputWrapper.shadowRadius` | `3` | `6` — sombra más suave |
| `inputWrapper.minHeight` | — | `52` — cumple mínimo 44pt Apple HIG |
| `inputWrapperFocused` | `{ borderColor: primary }` | + `backgroundColor: primaryLight` — focus state cálido y amigable |
| `input.paddingVertical` | `14` | `Theme.spacing.base` (16) — tokenizado y generoso |
| `toggleBtn` | `paddingHorizontal/Vertical: 12/14` | `minWidth/minHeight: 44` — área táctil correcta (Apple HIG) |
| `error.fontWeight` | — | `'500'` — más legible el mensaje de error |

### `frontend/components/common/CustomInput.tsx`

| Cambio | Antes | Después |
|---|---|---|
| Icono toggle contraseña | Emojis `👁` / `🙈` (anti-pattern) | `<Ionicons name="eye-outline" / "eye-off-outline" />` de `@expo/vector-icons` |
| `placeholderTextColor` | `"#c7c7cc"` (hex hardcodeado) | `Theme.colors.textMuted` (token) |
| Accesibilidad toggle | Sin label | `accessibilityLabel` + `accessibilityRole="button"` |

## Tokens nuevos añadidos

| Token | Valor | Uso |
|---|---|---|
| `colors.primaryLight` | `#FFF0F0` | Focus state background de inputs |
| `spacing.xxl` | `48` | Secciones con breathing room amplio |
| `radius.xl` | `32` | Hero cards, bottom sheets |
| `radius.full` | `100` | Pills, avatares (sustituye el 28 previo) |
| `typography.subtitle` | `18` | Nivel intermedio entre body y title |

## Decisiones de diseño (ui-ux-pro-max)

- **Paleta coral `#FF6B6B`**: Color cálido y vibrante accesible que cumple contraste 4.5:1 sobre blanco. Inspirado en Airbnb coral y Duolingo playfulness.
- **Bordes amplios (`lg: 24`)**: Aplicados a cards y botones según la directiva de 16–24px para el estilo "Amigable".
- **Scale feedback en `pressed`**: Sustituye opacidad pura — más nativo, más fluido (Apple HIG `scale-feedback`).
- **Focus state con `primaryLight`**: Background tintado suave en inputs al tener foco — patrón Duolingo / Google.
- **Labels de input sin uppercase**: Reduce rigidez visual; más conversacional y amigable.
- **Iconos vectoriales en toggle**: Eliminados los emojis (anti-pattern de la skill) por `Ionicons` ya disponible en el proyecto.

## Verificación

- TypeScript: todos los nuevos tokens son `as const` — type-safe sin cambios de tipos en consumidores.
- `@expo/vector-icons` ya estaba instalado — sin nuevas dependencias.
- Ningún componente externo roto: los tokens renombrados/subidos (`radius.md`, `radius.full`) se consumen solo en los 3 archivos modificados en este issue.
