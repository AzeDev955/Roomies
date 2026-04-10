# Issue #100 — UI para Desvincular Inquilinos

**Rama:** `feat/100-ui-para-desvincular-inquilinos`
**Fecha:** 2026-03-31

## Problema

Los endpoints de desvinculación (`DELETE /inquilino/habitacion` y `DELETE /viviendas/:id/habitaciones/:habId/inquilino`) existían desde el issue #90, pero no había ninguna interfaz de usuario que los llamara. El inquilino no podía abandonar su vivienda desde la app, y el casero no podía expulsar a un inquilino sin usar directamente la API.

## Solución

### Vista del Inquilino — `app/inquilino/inicio.tsx`

- Añadido handler `abandonarVivienda`: lanza un `Alert` de confirmación → llama a `DELETE /inquilino/habitacion` → resetea el estado local (`setTieneCasa(false)`, `setDatosCasa(null)`, `setIncidencias([])`) → la pantalla regresa al onboarding de forma inmediata sin navegación adicional.
- Botón "Abandonar Vivienda" al final del `ScrollView` del dashboard (después de la sección de incidencias), con `marginTop: 32` para separación visual clara.

**Decisión de ubicación**: el botón vive en `inicio.tsx` (no en `perfil.tsx`) porque el estado `tieneCasa` reside aquí. Resetearlo directamente provoca el cambio de vista sin navegaciones adicionales.

### Estilos — `styles/inquilino/inicio.styles.ts`

- `botonAbandonar`: estilo **outline rojo** (borde sin fondo sólido) para diferenciarlo del FAB rojo ya existente en la misma pantalla.
- `botonAbandonarTexto`: color rojo, 15px, semibold.

### Vista del Casero — `app/casero/vivienda/[id].tsx`

- Añadido handler `handleExpulsarInquilino`: lanza `Alert` de confirmación → llama a `DELETE /viviendas/:id/habitaciones/:hab.id/inquilino` → actualización **reactiva** del estado local con `setVivienda(prev => ...)` mapeando la habitación afectada a `{ ...h, inquilino: null }`. Sin recarga completa de la pantalla.
- Botón "Expulsar" integrado dentro del bloque `inquilinoInfo`, a la derecha del nombre y email del inquilino.

### Estilos — `styles/casero/vivienda/detalle.styles.ts`

- `inquilinoInfo` extendido con `flexDirection: 'row'`, `alignItems: 'center'`, `justifyContent: 'space-between'` para acomodar el botón Expulsar.
- Nuevo `inquilinoTextos` (flex: 1) para envolver el nombre y email del inquilino.
- Nuevos `botonExpulsar` (rojo sólido, compacto) y `botonExpulsarTexto`.

## Flujo resultante

**Inquilino:**
1. Dashboard visible → scroll hasta el final → botón "Abandonar Vivienda" (borde rojo)
2. Pulsar → Alert de confirmación
3. Confirmar → `DELETE /inquilino/habitacion` → pantalla cambia al onboarding instantáneamente
4. El inquilino puede volver a unirse con un nuevo código

**Casero:**
1. Detalle de vivienda → tarjeta de dormitorio con inquilino asignado → botón "Expulsar" a la derecha del nombre
2. Pulsar → Alert de confirmación
3. Confirmar → `DELETE .../inquilino` → la tarjeta muestra "Sin inquilino" de forma reactiva
4. El botón "Eliminar habitación" ya no fallará con error 400

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `frontend/app/inquilino/inicio.tsx` | Handler `abandonarVivienda` + botón |
| `frontend/styles/inquilino/inicio.styles.ts` | `botonAbandonar`, `botonAbandonarTexto` |
| `frontend/app/casero/vivienda/[id].tsx` | Handler `handleExpulsarInquilino` + botón en `inquilinoInfo` |
| `frontend/styles/casero/vivienda/detalle.styles.ts` | `inquilinoInfo` flex-row, `inquilinoTextos`, `botonExpulsar`, `botonExpulsarTexto` |
