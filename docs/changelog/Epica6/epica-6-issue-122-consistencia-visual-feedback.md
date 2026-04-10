# Épica 6 — Issue #122: Consistencia Visual y Feedback de Usuario

**Fecha:** 2026-04-02  
**Rama:** dev  
**Archivos modificados:** 28

---

## Resumen

Añade `react-native-toast-message` para reemplazar las alertas nativas bloqueantes, introduce un componente `LoadingScreen` reutilizable y normaliza el feedback táctil en toda la app.

---

## Cambios por área

### Nuevos archivos

| Archivo | Descripción |
|---|---|
| `frontend/constants/toastConfig.tsx` | Config visual de toast con colores de `Theme` (success/error/info). Borde izquierdo de acento, sombra estándar, tipografía coherente. |
| `frontend/components/common/LoadingScreen.tsx` | `ActivityIndicator` centrado a pantalla completa con `Theme.colors.primary` y `Theme.colors.background`. |

### `frontend/app/_layout.tsx`

- Añadido `<Toast config={toastConfig} />` como último hijo del árbol, encima del overlay de sesión — visible globalmente desde cualquier pantalla.

### Migración `Alert.alert` → `Toast.show`

**Regla aplicada:**
- Errores de red/API → `Toast.show({ type: 'error', text1: ... })`
- Éxitos → `Toast.show({ type: 'success', text1: ... })`
- Info puntual (código copiado) → `Toast.show({ type: 'info', text1: ... })`
- **Confirmaciones destructivas → se mantienen como `Alert.alert`** (necesitan botones Cancel/OK)

**Pantallas migradas (21 llamadas de error/éxito):**

| Pantalla | Alertas migradas |
|---|---|
| `app/index.tsx` | Error Google login, error login |
| `app/registro.tsx` | Error Google, validaciones (4), éxito registro |
| `app/rol.tsx` | Error guardar rol |
| `app/perfil.tsx` | Error cargar perfil |
| `app/casero/nueva-vivienda.tsx` | Error token Mapbox, error búsqueda, error crear |
| `app/casero/(tabs)/viviendas.tsx` | Error cargar viviendas |
| `app/casero/(tabs)/tablon.tsx` | Error cargar, error publicar, error eliminar (inner) |
| `app/casero/vivienda/[id].tsx` | Error cargar, info código copiado, error eliminar hab (inner), error expulsar (inner) |
| `app/casero/vivienda/[id]/incidencias.tsx` | Error cargar, error cambiar estado |
| `app/casero/vivienda/[id]/nueva-habitacion.tsx` | Error crear |
| `app/casero/vivienda/[id]/editar-habitacion.tsx` | Error editar |
| `app/inquilino/(tabs)/inicio.tsx` | Error canjear código, error abandonar (inner), error estado |
| `app/inquilino/(tabs)/tablon.tsx` | Error cargar, error publicar, error eliminar (inner) |
| `app/inquilino/nueva-incidencia.tsx` | Error enviar |
| `app/incidencia/[id].tsx` | Error cargar, error guardar, error estado, error eliminar (inner) |
| `app/tablon/[viviendaId].tsx` | Error cargar, error publicar, error eliminar (inner) |

**Confirmaciones que permanecen como `Alert.alert` (7):**
- Eliminar habitación, expulsar inquilino (`casero/vivienda/[id].tsx`)
- Eliminar anuncio (`casero/(tabs)/tablon.tsx`, `inquilino/(tabs)/tablon.tsx`, `tablon/[viviendaId].tsx`)
- Eliminar incidencia (`incidencia/[id].tsx`)
- Abandonar vivienda (`inquilino/(tabs)/inicio.tsx`)

### `LoadingScreen` en pantallas con spinner de pantalla completa

Reemplaza el patrón `if (loading) return <ActivityIndicator color="#007AFF">` con `<LoadingScreen />`:

- `casero/(tabs)/viviendas.tsx`
- `casero/vivienda/[id].tsx`
- `casero/vivienda/[id]/incidencias.tsx`
- `inquilino/(tabs)/inicio.tsx` (loader de incidencias: solo color corregido)
- `incidencia/[id].tsx`
- `app/perfil.tsx`

Los loaders de tablón (`loadingCtx`, inline `loading`) mantienen el patrón `ActivityIndicator` dentro del contenedor — se corrige el color hardcoded `#007AFF` → `Theme.colors.primary`.

### Feedback táctil en Pressables sueltos

Añadido `style={({ pressed }) => [..., pressed && styles.pressed/fabPressed/botonPressed]}` y estilo correspondiente en el archivo de estilos:

| Elemento | Archivos |
|---|---|
| Botón Google | `index.tsx`, `registro.tsx` |
| Enlace registro/login | `index.tsx`, `registro.tsx` |
| Pills rol (Casero/Inquilino) | `registro.tsx` |
| Botón "Cerrar Sesión" | `perfil.tsx` |
| FAB (+) | `casero/(tabs)/viviendas.tsx`, `casero/vivienda/[id].tsx`, `casero/(tabs)/tablon.tsx`, `inquilino/(tabs)/inicio.tsx`, `inquilino/(tabs)/tablon.tsx`, `tablon/[viviendaId].tsx` |
| Botones Cancelar/Publicar (modal) | Todos los tablones |
| Links "Ver incidencias" / "Tablón" | `casero/vivienda/[id].tsx` |
| Botón "Abandonar Vivienda" | `inquilino/(tabs)/inicio.tsx` |

---

## Decisiones técnicas

- **`react-native-toast-message` v2.3.x**: librería JS pura, compatible con Expo SDK 54 sin configuración nativa adicional.
- **Config visual centralizada**: `toastConfig.tsx` en `constants/` sigue el mismo patrón de `theme.ts` — única fuente de verdad para el aspecto de los toasts.
- **`LoadingScreen` sin `.styles.ts` separado**: el componente tiene un único `StyleSheet` de 4 líneas — no justifica un archivo adicional.
- **Confirmaciones destructivas mantienen `Alert.alert`**: `react-native-toast-message` no soporta botones interactivos. Reemplazar estos con un modal custom está fuera de scope.
- **`pressed` con opacidad en vez de escala**: más predecible que `scale` en listas largas (no provoca layout shifts).
