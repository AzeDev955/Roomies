# Issue #87 — Visibilidad integral de la vivienda y control de incidencias para Inquilinos

## Resumen

El dashboard del inquilino ahora muestra la vivienda completa: compañeros de piso y zonas comunes. El formulario de nueva incidencia incluye un selector de habitación filtrado (solo zonas comunes y la propia habitación). El backend valida que no se puedan reportar incidencias en el dormitorio de otro inquilino.

## Cambios

### Backend

**`backend/src/controllers/inquilino.controller.ts`**
- Añadido endpoint `GET /inquilino/vivienda` (`obtenerMiVivienda`) que devuelve la vivienda completa del inquilino con todas sus habitaciones e inquilinos asociados.

**`backend/src/routes/inquilino.routes.ts`**
- Registrada la ruta `GET /vivienda` con autenticación.

**`backend/src/controllers/incidencia.controller.ts`**
- `crearIncidencia` ahora acepta el campo opcional `habitacion_id`.
- Validación: si `habitacion_id` apunta a un DORMITORIO que no pertenece al inquilino que crea la incidencia → 403.

### Frontend

**`frontend/app/inquilino/inicio.tsx`**
- Nuevos tipos: `InquilinoResumen`, `HabitacionResumen`, `DatosCasa` ampliado con `miHabitacionId` y `habitaciones[]`.
- `cargarVivienda()` llama a `GET /inquilino/vivienda` para obtener la vivienda completa.
- El dashboard muestra sección "Compañeros de piso" (dormitorios con inquilino ajeno) y "Zonas comunes" (habitaciones no-DORMITORIO).
- El FAB pasa `habitacionesJson` y `miHabitacionId` como params a `nueva-incidencia`.

**`frontend/styles/inquilino/inicio.styles.ts`**
- Exportado `ETIQUETAS_TIPO` para etiquetas de tipo de habitación.
- Añadidos estilos: `companeroCard`, `companeroNombre`, `companeroHabitacion`, `zonasFilas`, `zonaCard`, `zonaNombre`, `zonaTipo`.

**`frontend/app/inquilino/nueva-incidencia.tsx`**
- Recibe `habitacionesJson` y `miHabitacionId` como params de navegación.
- Filtra las opciones de habitación: solo zonas comunes + propia habitación (no dormitorios de otros inquilinos).
- Sección "¿Dónde ocurre?" con pills seleccionables (toggle — selección opcional).
- Envía `habitacion_id` en el POST solo si hay selección.

**`frontend/styles/inquilino/nueva-incidencia.styles.ts`**
- Añadidos estilos: `habitacionFila`, `habitacionPill`, `habitacionPillActivo`, `habitacionPillTexto`, `habitacionPillTextoActivo`.
