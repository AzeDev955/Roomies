# Issue #101 — Permisos y Payload de Incidencias

**Rama:** `feat/101-permisos-payload-incidencias`
**Fecha:** 2026-03-31

## Problema

1. **Backend permisivo**: cualquier inquilino de una vivienda podía cambiar el estado de cualquier incidencia de esa vivienda, sin importar si tenía relación directa con ella.
2. **Frontend sin UI de estado**: el inquilino no tenía ningún control para cambiar el estado de una incidencia desde la app.

## Solución

### Backend — `backend/src/controllers/incidencia.controller.ts`

Refactorizado `actualizarEstadoIncidencia`:

- La query ahora incluye `habitacion: true` para verificar el tipo de habitación sin query extra.
- **CASERO**: sin cambios — puede editar cualquier incidencia de sus viviendas.
- **INQUILINO**: lógica nueva basada en 3 condiciones. Debe cumplir **al menos una**:
  - **a) Es el creador original** (`creador_id === usuarioId`)
  - **b) La incidencia está vinculada a su propio dormitorio** (`habitacion_id === miHabitacion.id`)
  - **c) La incidencia está vinculada a una zona común** (habitación de tipo distinto a `DORMITORIO`)
  
  Si no cumple ninguna → `403 Forbidden`.

**Casos resultantes:**
| Incidencia | Creador | Otro inquilino |
|---|---|---|
| Sin habitación vinculada | ✅ puede editar | ❌ 403 |
| Vinculada a su propio dormitorio | ✅ puede editar | ❌ 403 |
| Vinculada a zona común | ✅ puede editar | ✅ puede editar |
| Vinculada al dormitorio ajeno | ✅ puede editar (es creador) | ❌ 403 |

### Frontend — `frontend/app/inquilino/inicio.tsx`

- **Tipo `Incidencia`**: añadidos `creador_id: number` y `habitacion_id: number | null` (la API ya los devolvía).
- **Tipo `DatosCasa`**: añadido `miUsuarioId: number`, populado desde `miHab.inquilino.id` en `cargarVivienda`.
- **`tienePermisoEditar(item)`**: espeja la lógica del backend para determinar si mostrar el selector o el texto de solo lectura.
- **`actualizarEstado(id, nuevoEstado)`**: llama a `PATCH /incidencias/:id/estado` y actualiza el estado en el array local de forma reactiva (sin recargar la lista).
- **UI condicional en `renderItem`**:
  - Con permiso → 3 pills seleccionables (Pendiente / En proceso / Resuelta), el activo en azul.
  - Sin permiso → texto de solo lectura en gris.

### Estilos — `frontend/styles/inquilino/inicio.styles.ts`

Añadidos: `estadoSelector`, `estadoPill`, `estadoPillActivo`, `estadoPillTexto`, `estadoPillTextoActivo`, `estadoSoloLectura`.

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `backend/src/controllers/incidencia.controller.ts` | Nuevas reglas INQUILINO en `actualizarEstadoIncidencia` |
| `frontend/app/inquilino/inicio.tsx` | Tipos + lógica de permisos + selector de estado |
| `frontend/styles/inquilino/inicio.styles.ts` | Estilos del selector de estado |
