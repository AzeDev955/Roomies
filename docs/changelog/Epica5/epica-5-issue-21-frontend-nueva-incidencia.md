# Épica 5 — Issues #20 + #21: Pantallas del inquilino

## Qué se hizo

### `app/inquilino/inicio.tsx` (issue #20 — recreado)

Pantalla con dos vistas controladas por el estado `tieneCasa`:

**Vista onboarding (`tieneCasa === false`):**
- Título + subtítulo explicativo
- `TextInput` grande con `autoCapitalize="characters"`, `maxLength={9}` y placeholder `ROOM-XXXX`
- Botón "Canjear Código" → establece `tieneCasa = true`

**Vista dashboard (`tieneCasa === true`):**
- Bienvenida con vivienda + habitación (mock)
- `FlatList` de incidencias con círculo indicador de color por prioridad
- FAB rojo navega a `/inquilino/nueva-incidencia`

### `app/inquilino/nueva-incidencia.tsx` (issue #21)

Formulario de creación de incidencia:
- `TextInput` para título
- `TextInput` multilínea (`height: 120`) para descripción
- Selector de prioridad: 3 `Pressable` en fila con fondo de color (`VERDE`, `AMARILLO`, `ROJO`). El seleccionado aparece a opacidad 1, los demás a 0.35
- Botón "Enviar Incidencia" → `console.log({ titulo, descripcion, prioridad })` + `router.back()`

## Sistema de colores de prioridad

| Valor | Color | Etiqueta |
|---|---|---|
| `VERDE` | `#34C759` | Sugerencia |
| `AMARILLO` | `#FF9500` | Aviso |
| `ROJO` | `#FF3B30` | Urgente |

`COLORES_PRIORIDAD` y las etiquetas se exportan desde los archivos de estilos para mantener toda la lógica visual centralizada.

## Archivos creados

| Archivo | Descripción |
|---|---|
| `frontend/app/inquilino/inicio.tsx` | Onboarding + dashboard (issue #20) |
| `frontend/styles/inquilino/inicio.styles.ts` | Estilos + `COLORES_PRIORIDAD` + `ETIQUETAS_ESTADO` |
| `frontend/app/inquilino/nueva-incidencia.tsx` | Formulario de nueva incidencia (issue #21) |
| `frontend/styles/inquilino/nueva-incidencia.styles.ts` | Estilos + `COLORES_PRIORIDAD` + `ETIQUETAS_PRIORIDAD` |

## Pendiente

- `POST /api/inquilino/unirse` — conectar el botón "Canjear Código" con la API real
- `POST /api/incidencias` — conectar "Enviar Incidencia" con la API real
- `GET /api/incidencias` — reemplazar mock data del dashboard
