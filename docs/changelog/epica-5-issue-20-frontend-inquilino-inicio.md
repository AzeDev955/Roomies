# Épica 5 — Issue #20: Pantalla de inicio del inquilino

## Qué se hizo

Pantalla `app/inquilino/inicio.tsx` con dos vistas controladas por el estado local `tieneCasa`.

### Vista de onboarding (`tieneCasa === false`)

- Título "Únete a tu nuevo hogar" + subtítulo explicativo
- `TextInput` grande centrado con placeholder `ROOM-XXXX`; fuerza mayúsculas y limita a 9 caracteres
- Botón "Canjear Código" que establece `tieneCasa = true` (simula aceptación del backend)

### Vista de dashboard (`tieneCasa === true`)

- Texto de bienvenida mockeado: vivienda + habitación
- `FlatList` de incidencias mock con tres prioridades:
  - 🟢 `VERDE` — sugerencias/mejoras
  - 🟡 `AMARILLO` — fallos no urgentes
  - 🔴 `ROJO` — averías graves / emergencias
- Cada tarjeta muestra: indicador de color (círculo), título, descripción, estado y fecha
- FAB rojo (`#FF3B30`) navega a `/inquilino/nueva-incidencia` (pantalla pendiente)

### Sistema de colores

`COLORES_PRIORIDAD` y `ETIQUETAS_ESTADO` se exportan desde el archivo de estilos para mantener toda la información visual centralizada. El indicador de color usa `[styles.indicador, { backgroundColor: COLORES_PRIORIDAD[item.prioridad] }]` — única excepción al no-inline, necesaria para valores dinámicos.

## Archivos creados

| Archivo | Descripción |
|---|---|
| `frontend/app/inquilino/inicio.tsx` | Pantalla con lógica onboarding + dashboard |
| `frontend/styles/inquilino/inicio.styles.ts` | Estilos + `COLORES_PRIORIDAD` + `ETIQUETAS_ESTADO` |

## Pendiente

- `app/inquilino/nueva-incidencia.tsx` — formulario de crear incidencia (FAB target)
- Reemplazar mock data con llamadas reales a `GET /api/incidencias` y `POST /api/inquilino/unirse`
