# Roomies — Sistema de Diseño

> Guía de referencia visual para el frontend. Refleja el estado actual post-Épica 9 ("Amigable y Colorido").

---

## Filosofía

**Tono:** Cálido, amigable y colorido. Inspirado en Airbnb y Duolingo — cercano sin ser infantil, moderno sin ser frío.

**Principios:**
1. Espacio generoso — el contenido respira, los elementos no están apretados.
2. Color con propósito — cada color transmite un estado semántico claro.
3. Bordes suaves — radios grandes (`lg: 24`, `xl: 32`) en tarjetas y modales.
4. Sin bordes decorativos — las separaciones se logran con fondos, no con líneas de 1px.

---

## Paleta de colores

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#FF6B6B` | Coral cálido — acento principal, FABs, pills activos, CTAs |
| `primaryLight` | `#FFF0F0` | Focus state en inputs, fondos activos suaves |
| `primaryDisabled` | `#FFBCBC` | Botones primarios deshabilitados |
| `success` | `#06D6A0` | Acciones positivas, botones de guardar, Switch activo |
| `successDisabled` | `#A3E8DA` | Botones success deshabilitados |
| `danger` | `#FF4757` | Acciones destructivas (botón suave: `danger + '18'` bg) |
| `warning` | `#FFA726` | Alertas y prioridad media |
| `background` | `#F8F7F4` | Fondo de todas las pantallas (off-white cálido, no frío) |
| `surface` | `#FFFFFF` | Cards, inputs, modales |
| `surface2` | `#F2F0EB` | Chips secundarios, fondos de secciones anidadas |
| `border` | `#E8E6E0` | Borde cálido — siempre 2px, nunca 1px |
| `text` | `#1A1A2E` | Texto principal (deep navy, no negro puro) |
| `textSecondary` | `#6B6B80` | Labels de campos, texto de apoyo |
| `textTertiary` | `#9E9EAF` | Timestamps, datos terciarios |
| `textMuted` | `#C4C4D0` | `placeholderTextColor` en todos los inputs |
| `textMedium` | `#3D3D56` | Texto de peso medio |
| `shadow` | `#000000` | Color base de sombras (con opacidad baja) |

### Soft tints de prioridad (incidencias)

| Prioridad | Fondo | Texto / Borde |
|---|---|---|
| VERDE (Sugerencia) | `#E5FAF3` | `#0D7A5E` |
| AMARILLO (Aviso) | `#FFF5E0` | `#A05C00` |
| ROJO (Urgente) | `#FFE8E8` | `#C0392B` |

### Soft tints de estado (incidencias)

| Estado | Fondo | Texto / Borde |
|---|---|---|
| PENDIENTE | `#FFF5E0` | `#A05C00` |
| EN_PROCESO | `#E8F4FF` | `#1565C0` |
| RESUELTA | `#E5FAF3` | `#0D7A5E` |

---

## Espaciado

```
xs:   4px
sm:   8px
md:  12px
base: 16px
lg:  24px
xl:  32px
xxl: 48px
```

Regla: padding interno de cards → `lg (24)`. Margen entre secciones → `xl (32)`. Separación entre secciones grandes → `xxl (48)`.

---

## Radio de bordes

```
sm:   8px  — badges de estado pequeños
md:  16px  — inputs, chips menores
lg:  24px  — cards, botones, contenedores de acción
xl:  32px  — bottom sheets, hero cards
full: 100px — pills de tipo/prioridad/avatar
```

---

## Tipografía

```
caption:  12px
label:    14px  — labels de campo (uppercase, letterSpacing: 0.4)
body:     15px
input:    16px  — texto dentro de inputs y botones
subtitle: 18px  — títulos de sección
title:    20px
heading:  24px  — títulos de pantalla
hero:     32px  — greeting, números destacados
```

Pesos habituales: `700` headings · `600` labels · `500` datos secundarios · `400` body.

---

## Componentes

### Inputs

- `borderWidth: 2`, `borderColor: border`, `minHeight: 52`
- Foco: `borderColor: primary`, `backgroundColor: primaryLight`
- `placeholderTextColor: textMuted` — siempre
- `borderRadius: md (16)`

### Pills de selección (tipo habitación, ubicación)

- **Inactivo:** `borderWidth: 2`, `borderColor: border`, `backgroundColor: transparent`, `borderRadius: full`
- **Activo:** `backgroundColor: primary + '18'`, `borderColor: primary`, texto `primary`

### Pills de prioridad / estado

- Usan siempre el soft tint de su categoría semántica
- **Activo:** `borderColor: PRIORIDAD_BORDER[p]`, `opacity: 1`
- **Inactivo:** `borderColor: transparent`, `opacity: 0.55`
- `borderWidth: 2` fijo para evitar saltos de layout

### Botones principales

- `borderRadius: lg (24)`, `minHeight: 52`, `paddingVertical: 16`
- Press feedback: `opacity` + `transform: [{ scale: 0.97 }]`

### Switch

```tsx
trackColor={{ false: Theme.colors.border, true: Theme.colors.success }}
thumbColor={Theme.colors.surface}
```

### Cards

- `borderRadius: lg (24)`, `padding: lg (24)`, `backgroundColor: surface`
- Sombra: `shadowOpacity: 0.06`, `shadowRadius: 12`, `elevation: 4`

### Tab bar

- Sin `borderTopWidth`
- Sombra suave: `elevation: 12`, `shadowOffset: { 0, -3 }`, `shadowOpacity: 0.07`

### Bottom sheet modal

- `borderTopLeftRadius: xl (32)`, `borderTopRightRadius: xl (32)`
- Handle bar: `40×4px`, `borderRadius: 2`, color `border`
- Backdrop: `Pressable` con `rgba(0,0,0,0.4)`

### Empty states

```
┌─────────────────────────────────┐
│  [caja 80–88px, radius xl, tint] │
│          [Ionicon 40px]          │
│                                  │
│       Título bold heading        │
│   Subtítulo textSecondary body   │
│                                  │
│   [CTA solo si rol creador]      │
└─────────────────────────────────┘
```

---

## Íconos

Exclusivamente **`Ionicons`** de `@expo/vector-icons`. Nunca emojis como íconos estructurales.

| Uso | Ícono |
|---|---|
| Añadir (FAB) | `add` |
| Tablón vacío | `megaphone-outline` |
| Sin vivienda | `home-outline` / `key-outline` |
| Incidencias OK | `checkmark-circle-outline` |
| Limpieza vacía | `sparkles-outline` |
| Turnos vacíos | `calendar-outline` |
| Ojo (contraseña) | `eye-outline` / `eye-off-outline` |
| Correo | `mail-outline` |
| Teléfono | `call-outline` |

---

## Accesibilidad

- Todos los Pressables de acción tienen `accessibilityLabel` y `accessibilityRole`
- Touch targets mínimo `44×44pt` (`minHeight: 52` en botones + hitSlop en íconos)
- Color nunca es el único indicador — siempre acompañado de texto o ícono
- Contraste WCAG AA: los soft tints oscuros sobre fondos claros cumplen 4.5:1
