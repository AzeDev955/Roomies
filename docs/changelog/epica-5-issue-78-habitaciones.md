# Issue #78 — Refactorización y mejoras en gestión de habitaciones

## Resumen

Mejoras en cuatro áreas del flujo de habitaciones del casero: correcciones visuales en el selector de tipo, creación de habitaciones inline al crear vivienda, edición y borrado de habitaciones desde el detalle, y visualización del inquilino asignado en cada tarjeta de habitación.

---

## Cambios en el backend

### `vivienda.controller.ts`

**`obtenerVivienda`** — ahora incluye el inquilino asignado a cada habitación:
```typescript
include: {
  habitaciones: {
    include: {
      inquilino: {
        select: { id: true, nombre: true, apellidos: true, email: true },
      },
    },
  },
},
```

**`crearVivienda`** — acepta un array opcional `habitaciones` en el body. Cada habitación se crea en la misma transacción mediante nested create de Prisma. Se genera `codigo_invitacion` automáticamente para habitaciones habitables.

**`editarHabitacion`** (nuevo) — `PUT /viviendas/:id/habitaciones/:habId`:
- Verifica que la vivienda pertenece al casero autenticado.
- Si `es_habitable` cambia de `false → true`: genera nuevo código de invitación.
- Si `es_habitable` cambia de `true → false`: anula el código (`null`).
- Si no cambia: conserva el código existente.

**`eliminarHabitacion`** (nuevo) — `DELETE /viviendas/:id/habitaciones/:habId`:
- Verifica propiedad de la vivienda.
- Devuelve **400** si la habitación tiene inquilino asignado (`inquilino_id !== null`).
- En caso contrario, elimina la habitación y devuelve **204 No Content**.

### `vivienda.routes.ts`

Rutas añadidas:
```
PUT    /viviendas/:id/habitaciones/:habId
DELETE /viviendas/:id/habitaciones/:habId
```

---

## Cambios en el frontend

### `nueva-habitacion.tsx`

- Añadido mapa `ETIQUETAS_TIPO` — los pills muestran "Baño", "Salón", etc. en lugar del valor raw de la enum.
- El switch "¿Es habitable?" solo se muestra cuando `tipo === 'DORMITORIO'`.
- Al cambiar el tipo a uno distinto de DORMITORIO, `esHabitable` se fuerza a `false`.

### `nueva-vivienda.tsx`

- Sección "Habitaciones (opcional)" añadida al formulario.
- Mini-form con nombre, tipo (pills con etiquetas), switch condicional y metros cuadrados.
- Lista de habitaciones añadidas con botón "×" para eliminar antes de guardar.
- El submit incluye el array `habitaciones` en el body de `POST /viviendas`.

### `nueva-vivienda.styles.ts`

Estilos añadidos: `tipoFila`, `tipoPill`, `tipoPillActivo`, `tipoPillTexto`, `tipoPillTextoActivo`, `switchFila`, `switchLabel`, `botonAnadirHabitacion`, `botonAnadirHabitacionTexto`, `habitacionItem`, `habitacionItemTexto`, `habitacionItemBadgeTexto`, `habitacionItemEliminar`.

### `[id].tsx` (detalle vivienda)

- Tipo `Habitacion` extendido con campo `inquilino: Inquilino | null`.
- Mapa `ETIQUETAS_TIPO` para mostrar el tipo legible en la cabecera de la tarjeta.
- Bloque inquilino: si tiene inquilino muestra nombre + email con fondo azul claro; si no, muestra "Sin inquilino".
- Botones **Editar** y **Eliminar** en cada tarjeta.
  - Editar navega a `editar-habitacion` pasando los datos actuales como params.
  - Eliminar muestra Alert de confirmación y llama a `DELETE /viviendas/:id/habitaciones/:habId`. Si el servidor devuelve error (inquilino asignado), muestra el mensaje del backend.

### `detalle.styles.ts`

Estilos añadidos: `inquilinoInfo`, `inquilinoNombre`, `inquilinoEmail`, `sinInquilino`, `accionFila`, `botonEditar`, `botonEliminar`, `botonAccionTexto`.

### `editar-habitacion.tsx` (nuevo)

Pantalla nueva en `frontend/app/casero/vivienda/[id]/editar-habitacion.tsx`.
- Recibe params: `habId`, `nombre`, `tipo`, `esHabitable`, `metrosCuadrados`.
- Formulario idéntico a `nueva-habitacion.tsx` con los campos pre-rellenados.
- Al guardar: `PUT /viviendas/:id/habitaciones/:habId` → `router.back()`.
- Reutiliza `@/styles/casero/vivienda/nueva-habitacion.styles` sin crear archivo de estilos nuevo.

---

## Decisiones técnicas

- **Nested create de Prisma**: se eligió el nested create sobre crear la vivienda primero y luego las habitaciones en bucle, para garantizar atomicidad (si falla una habitación, toda la operación se revierte).
- **`codigo_invitacion` al editar**: se regenera el código solo cuando cambia `es_habitable`, evitando invalidar códigos ya compartidos con inquilinos.
- **Guard inquilino al eliminar**: se valida en el backend (no en el frontend) para que la restricción sea irrevocable independientemente del cliente.
- **`editar-habitacion` sin estilos propios**: reutiliza `nueva-habitacion.styles` para mantener coherencia visual sin duplicar código.
