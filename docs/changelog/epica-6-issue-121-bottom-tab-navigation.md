# Issue #121 — Navegación Principal (Bottom Tab Navigation)

## Resumen

Implementación de Tab Bar Navigation con Expo Router usando grupos `(tabs)` separados por rol. Cada rol tiene tres pestañas: Mi Vivienda, Tablón y Perfil.

---

## Estructura creada

```
app/
  casero/
    _layout.tsx                  NUEVO — Stack (permite apilar nova-vivienda, vivienda/[id], etc. sobre el tab bar)
    (tabs)/
      _layout.tsx                NUEVO — Tabs: viviendas | tablon | perfil
      viviendas.tsx              MOVIDO desde casero/viviendas.tsx
      tablon.tsx                 NUEVO — Tablón del casero (auto-fetches viviendaId)
      perfil.tsx                 NUEVO — Re-export de app/perfil.tsx
  inquilino/
    _layout.tsx                  NUEVO — Stack
    (tabs)/
      _layout.tsx                NUEVO — Tabs: inicio | tablon | perfil
      inicio.tsx                 MOVIDO desde inquilino/inicio.tsx
      tablon.tsx                 NUEVO — Tablón del inquilino (auto-fetches viviendaId)
      perfil.tsx                 NUEVO — Re-export de app/perfil.tsx
```

---

## Diseño del Tab Bar

Configuración en ambos `_layout.tsx` de tabs:
- `tabBarActiveTintColor`: `Theme.colors.primary` (#007AFF)
- `tabBarInactiveTintColor`: `Theme.colors.textTertiary` (#9e9e9e)
- `tabBarStyle.backgroundColor`: `Theme.colors.surface` (blanco)
- `tabBarStyle.borderTopColor`: `Theme.colors.border`
- Iconos: `Ionicons` (`home-outline`, `newspaper-outline`, `person-outline`)
- `headerShown: false` global

---

## Tabs por rol

### Casero
| Tab | Icono | Pantalla | Ruta |
|---|---|---|---|
| Mi Vivienda | `home-outline` | `casero/(tabs)/viviendas.tsx` | `/casero/viviendas` |
| Tablón | `newspaper-outline` | `casero/(tabs)/tablon.tsx` | `/casero/tablon` |
| Perfil | `person-outline` | `casero/(tabs)/perfil.tsx` | `/casero/perfil` |

### Inquilino
| Tab | Icono | Pantalla | Ruta |
|---|---|---|---|
| Mi Vivienda | `home-outline` | `inquilino/(tabs)/inicio.tsx` | `/inquilino/inicio` |
| Tablón | `newspaper-outline` | `inquilino/(tabs)/tablon.tsx` | `/inquilino/tablon` |
| Perfil | `person-outline` | `inquilino/(tabs)/perfil.tsx` | `/inquilino/perfil` |

---

## Tablón tabs (auto-fetch viviendaId)

Las pantallas `(tabs)/tablon.tsx` son auto-suficientes: no necesitan `viviendaId` en la URL.

- **Casero**: llama `GET /auth/me` + `GET /viviendas` → usa la primera vivienda
- **Inquilino**: llama `GET /inquilino/vivienda` → usa la vivienda de su habitación
- Estado vacío ("sin vivienda") con mensaje contextual por rol

---

## URLs preservadas

El grupo `(tabs)` en Expo Router es transparente en URLs. Las rutas existentes no cambian:
- `/casero/viviendas` → sigue apuntando a `casero/(tabs)/viviendas.tsx`
- `/inquilino/inicio` → sigue apuntando a `inquilino/(tabs)/inicio.tsx`
- `CommonActions.reset({ name: 'casero/viviendas' })` funciona sin cambios

---

## Eliminaciones

- `app/casero/viviendas.tsx` → eliminado (movido a `casero/(tabs)/viviendas.tsx`)
- `app/inquilino/inicio.tsx` → eliminado (movido a `inquilino/(tabs)/inicio.tsx`)
- Icono `iconoPerfil` (botón absoluto) eliminado de viviendas y inicio — el perfil ahora es una pestaña
- Link "Tablón de anuncios →" inline en `inquilino/inicio` eliminado — ahora es una pestaña dedicada
- Estilos `iconoPerfil` y `enlaceTablon*` eliminados de sus respectivos `.styles.ts`

---

## Verificación

- `npx tsc --noEmit` → 0 errores
- Login CASERO → tab bar con 3 pestañas visible en `/casero/viviendas`
- Login INQUILINO → tab bar con 3 pestañas visible en `/inquilino/inicio`
- Navegar a Tablón sin tener vivienda → mensaje de estado vacío
- Navegar a Perfil → pantalla de perfil con botón "Cerrar Sesión"
- `router.push('/casero/vivienda/X')` desde viviendas → apila pantalla encima del tab bar (tab bar desaparece)
