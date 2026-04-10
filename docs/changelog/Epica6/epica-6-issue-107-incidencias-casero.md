# Issue #107 — Burbuja de notificaciones e incidencias para el casero

**Rama:** `feat/107-incidencias-casero`
**Fecha:** 2026-03-31

## Problema

El casero no tenía ninguna visibilidad sobre el estado de las incidencias de sus viviendas:
1. El dashboard de viviendas no indicaba si había incidencias activas.
2. No existía ninguna pantalla para ver ni gestionar las incidencias desde el rol casero.

## Solución

### Badge de prioridad en el dashboard — `frontend/app/casero/viviendas.tsx`

- La tarjeta de cada vivienda muestra un badge (burbuja) en la esquina superior derecha cuando hay incidencias activas (PENDIENTE o EN_PROCESO).
- El número del badge indica el total de incidencias activas.
- El color refleja la prioridad más alta entre esas incidencias: verde, naranja o rojo.
- Helper `getMaxPrioridad()` fuera del componente; mapa `BADGE_POR_PRIORIDAD` para seleccionar el estilo sin inline styles.

### Backend — `backend/src/controllers/incidencia.controller.ts`

- `GET /viviendas`: incluye `incidencias` filtradas por `PENDIENTE`/`EN_PROCESO` con solo `{ prioridad }` para el badge.
- `GET /incidencias`: acepta nuevo query param opcional `?viviendaId=X` para filtrar por vivienda (CASERO). Añadido `habitacion: { select: { id, nombre } }` al include para mostrar el nombre del cuarto en la pantalla de gestión.

### Pantalla de incidencias — `frontend/app/casero/vivienda/[id]/incidencias.tsx`

- Nueva pantalla accesible desde el detalle de vivienda.
- Carga `GET /incidencias?viviendaId=:id` y muestra cada incidencia con:
  - Dot de prioridad (verde/naranja/rojo)
  - Título y descripción
  - Creador, habitación vinculada (si existe), fecha
  - Pills de estado (Pendiente / En proceso / Resuelta) — siempre editables para el casero
- Actualización reactiva del estado local tras PATCH, sin recargar la lista.

### Entrada al flujo — `frontend/app/casero/vivienda/[id].tsx`

- Botón "Ver Incidencias" entre la dirección y el listado de habitaciones; navega a `[id]/incidencias`.

## Archivos modificados / creados

| Archivo | Cambio |
|---|---|
| `backend/src/controllers/incidencia.controller.ts` | Query param `?viviendaId`, include `habitacion` |
| `frontend/app/casero/viviendas.tsx` | Badge con color de prioridad máxima |
| `frontend/styles/casero/viviendas.styles.ts` | Estilos `badge`, `badgeVerde`, `badgeAmarillo`, `badgeRojo`, `badgeTexto` |
| `frontend/app/casero/vivienda/[id].tsx` | Botón "Ver Incidencias" |
| `frontend/styles/casero/vivienda/detalle.styles.ts` | Estilos `botonIncidencias`, `botonIncidenciasTexto` |
| `frontend/app/casero/vivienda/[id]/incidencias.tsx` | Nueva pantalla (creado) |
| `frontend/styles/casero/vivienda/incidencias.styles.ts` | Estilos de la pantalla (creado) |
