# Issue #110 — Refactorización visual y ciclo de vida de Incidencias

**Rama:** `feat/110-ciclo-vida-incidencias`
**Fecha:** 2026-04-01

## Problema

Las incidencias carecían de ciclo de vida completo:
1. No existía pantalla de detalle, edición ni borrado.
2. El casero las veía en una pantalla separada desconectada de sus habitaciones.
3. No había separación visual entre incidencias activas e historial de resueltas.

## Solución

### Backend — `backend/src/controllers/incidencia.controller.ts`

Tres nuevos handlers:

- **`obtenerIncidencia` (GET /:id)**: devuelve la incidencia completa con `vivienda`, `creador` y `habitacion`. Verifica acceso: CASERO → su vivienda; INQUILINO → tiene habitación en esa vivienda.
- **`editarIncidencia` (PUT /:id)**: edita `titulo` y/o `descripcion`. Permisos: CASERO → su vivienda; INQUILINO → solo si es `creador_id`.
- **`eliminarIncidencia` (DELETE /:id)**: mismos permisos que editar. Responde 204.

### Backend — `backend/src/routes/incidencia.routes.ts`

Añadidas las rutas `GET /:id`, `PUT /:id`, `DELETE /:id`.

### Backend — `backend/src/controllers/vivienda.controller.ts`

`obtenerVivienda` ahora incluye, dentro de cada habitación, sus incidencias activas (PENDIENTE/EN_PROCESO) con `{ id, titulo, prioridad, estado }`.

### Frontend — `frontend/app/casero/vivienda/[id].tsx`

- Eliminado el botón genérico "Ver Incidencias".
- Tipo `Habitacion` extendido con `incidencias: IncidenciaResumen[]`.
- En cada tarjeta de habitación: lista de indicadores (dot de color + título) para las incidencias activas. Cada indicador navega a `/incidencia/:id?puedeGestionar=true`.

### Frontend — `frontend/app/casero/vivienda/[id]/incidencias.tsx`

- Lista separada en `activas` (PENDIENTE/EN_PROCESO) y `historial` (RESUELTA).
- Tarjetas tapeables → navegan al detalle.
- Botón toggle "Ver historial (N)" / "Ocultar historial" debajo de las activas.

### Frontend — `frontend/app/inquilino/inicio.tsx`

- Lista principal muestra solo incidencias activas.
- Tarjetas tapeables → navegan a `/incidencia/:id?puedeGestionar=true/false` según si el inquilino es creador.
- Botón toggle "Ver historial (N)" para resueltas.
- Reemplazado `FlatList` anidado por `renderIncidencia()` mapeado directamente (compatible con `ScrollView` padre).

### Frontend — `frontend/app/incidencia/[id].tsx` (nuevo)

Pantalla de detalle compartida para ambos roles. Recibe `puedeGestionar` como query param.
- Muestra: dot de prioridad, título, descripción, creador, habitación vinculada, fecha, estado (solo lectura).
- Si `puedeGestionar=true`: botones Editar (modo edición inline con TextInput) y Eliminar (Alert de confirmación).

### Estilos nuevos / modificados

| Archivo | Cambio |
|---|---|
| `frontend/styles/incidencia/detalle.styles.ts` | Nuevo — estilos completos de la pantalla de detalle |
| `frontend/styles/casero/vivienda/detalle.styles.ts` | Añadidos `incidenciasHabitacion`, `incidenciaFila`, `incidenciaDot`, `incidenciaTitulo`; eliminado `botonIncidencias` |
| `frontend/styles/casero/vivienda/incidencias.styles.ts` | Añadidos `historialToggle`, `historialToggleTexto`, `historialSeparador` |
| `frontend/styles/inquilino/inicio.styles.ts` | Añadidos `historialToggle`, `historialToggleTexto` |

## Archivos modificados / creados

| Archivo | Tipo |
|---|---|
| `backend/src/controllers/incidencia.controller.ts` | Modificado |
| `backend/src/routes/incidencia.routes.ts` | Modificado |
| `backend/src/controllers/vivienda.controller.ts` | Modificado |
| `frontend/app/casero/vivienda/[id].tsx` | Modificado |
| `frontend/app/casero/vivienda/[id]/incidencias.tsx` | Modificado |
| `frontend/app/inquilino/inicio.tsx` | Modificado |
| `frontend/app/incidencia/[id].tsx` | Creado |
| `frontend/styles/incidencia/detalle.styles.ts` | Creado |
| `frontend/styles/casero/vivienda/detalle.styles.ts` | Modificado |
| `frontend/styles/casero/vivienda/incidencias.styles.ts` | Modificado |
| `frontend/styles/inquilino/inicio.styles.ts` | Modificado |
