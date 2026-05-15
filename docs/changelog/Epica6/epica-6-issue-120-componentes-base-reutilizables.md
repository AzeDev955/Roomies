# Issue #120 — Wireframes y Componentes Base Reutilizables

## Resumen

Creación de tres componentes base en `frontend/components/common/` usando `Theme` como única fuente de verdad. Refactorización de Login, Registro, Lista de viviendas y Detalle de vivienda para eliminar primitivos directos duplicados.

---

## Nuevos componentes

### `CustomButton` (`components/common/CustomButton.tsx` + `.styles.ts`)
- Variantes: `primary`, `secondary`, `outline`, `danger`, `success`
- Props: `label`, `onPress`, `variant`, `disabled`, `loading`, `style`
- `loading={true}` → muestra `ActivityIndicator` en lugar del label
- `disabled={true}` → opacidad 0.5, interacción bloqueada
- Estado press: opacidad 0.8 vía `({ pressed }) => [...]`

### `Card` (`components/common/Card.tsx` + `.styles.ts`)
- Props: `children`, `onPress?`, `style?`
- Si recibe `onPress` → renderiza `Pressable` con press feedback
- Si no → `View` estático
- Sombra estándar cross-platform (iOS shadow + Android elevation)

### `CustomInput` (`components/common/CustomInput.tsx` + `.styles.ts`)
- Extiende `TextInputProps` + `label`, `error?`, `secureToggle?`
- Label en uppercase encima del campo
- Borde focus: `1.5px Theme.colors.primary`
- Borde error: `1.5px Theme.colors.danger` + mensaje rojo debajo
- `secureToggle={true}`: gestiona `secureTextEntry` internamente, elimina estado `verPass` de las pantallas

---

## Pantallas refactorizadas

### `app/index.tsx` (Login)
- Reemplazados: `label + TextInput` (email) → `<CustomInput>`
- Reemplazados: `inputPasswordFila + TextInput + Pressable(verPass)` → `<CustomInput secureToggle>`
- Reemplazado: `Pressable botonLogin` → `<CustomButton>`
- Eliminado estado `verPass`
- Eliminados imports: `TextInput`, `ActivityIndicator`

### `app/registro.tsx` (Registro)
- Reemplazados los 7 campos (`label + TextInput`) → `<CustomInput>` cada uno
- Reemplazado: `Pressable botonRegistrar` → `<CustomButton>`
- Eliminado estado `verPass`
- Eliminados imports: `TextInput`, `ActivityIndicator`

### `app/casero/viviendas.tsx`
- Reemplazado: `<Pressable style={styles.card}>` → `<Card onPress={...}>`

### `app/casero/vivienda/[id].tsx`
- Reemplazado: `<View style={styles.card}>` → `<Card>` (por habitación)
- Reemplazados: `botonExpulsar`, `botonEditar`, `botonEliminar`, `compartirBoton` → `<CustomButton variant="...">` con style overrides de tamaño

---

## Estilos eliminados (ahora en el componente)

| Archivo | Estilos eliminados |
|---|---|
| `styles/index.styles.ts` | `label`, `input`, `inputPasswordFila`, `inputPassword`, `botonVerPass`, `botonVerPassTexto`, `botonLogin`, `botonLoginDeshabilitado`, `botonLoginTexto` |
| `styles/registro.styles.ts` | `label`, `input`, `inputPasswordFila`, `inputPassword`, `botonVerPass`, `botonVerPassTexto`, `botonRegistrar`, `botonRegistrarDisabled`, `botonRegistrarTexto` |
| `styles/casero/viviendas.styles.ts` | `card` |
| `styles/casero/vivienda/detalle.styles.ts` | `card`, `botonExpulsar`, `botonExpulsarTexto`, `botonEditar`, `botonEliminar`, `botonAccionTexto`, `compartirBoton`, `compartirBotonTexto` |

---

## Scope no refactorizado (intencionado)

- **FABs**: circular, posición absoluta, tamaño fijo (56px) — fuera del patrón `CustomButton`
- **Botón Google**: layout especial con icono `AntDesign` — se mantiene como `Pressable`
- **Role pills** en Registro: comportamiento toggle, no son botones de acción
- **Botón "Revelar código"**: lógica biométrica específica — se mantiene como `Pressable`

## Verificación

- `npx tsc --noEmit` → 0 errores
