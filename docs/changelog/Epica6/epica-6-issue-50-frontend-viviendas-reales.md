# Épica 6 — Issue #50: Lista de viviendas del casero con datos reales

## Contexto

La pantalla `app/casero/viviendas.tsx` usaba un array mockeado estático. Este issue conecta la pantalla con el endpoint real `GET /api/viviendas` usando el cliente Axios centralizado.

## Cambios realizados

### `frontend/app/casero/viviendas.tsx`

- Eliminado `MOCK_VIVIENDAS` y el estado inicializado con mock.
- Añadido estado `loading` (inicializado en `true`).
- Función `cargarViviendas`: llama a `api.get('/viviendas')`, guarda el resultado, gestiona errores con `Alert` y pone `loading = false` en `finally`.
- `useFocusEffect` + `useCallback` para recargar automáticamente cada vez que la pantalla gana el foco (p. ej. al volver desde la pantalla de crear vivienda).
- Renderizado condicional:
  - `loading = true` → `ActivityIndicator` centrado
  - Lista vacía → texto amigable animando a pulsar el FAB
  - Lista con datos → `FlatList` con `item.alias_nombre`, `item.direccion`, `item.habitaciones?.length`

### `frontend/styles/casero/viviendas.styles.ts`

- Añadidos `loaderContainer` (centrado para el spinner) y `emptySubtext` (subtexto del estado vacío).
