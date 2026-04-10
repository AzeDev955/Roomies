# Issue #86 — Lógica de ocupación en zonas comunes

## Problema

Las tarjetas de habitación en el detalle de vivienda mostraban el bloque de inquilino ("Sin inquilino" o datos del inquilino) y el bloque de código de invitación para **todas** las habitaciones, sin distinción de tipo. Las zonas comunes (BANO, COCINA, SALON, OTRO) nunca tienen inquilino asignado ni código de invitación, por lo que mostrar "Sin inquilino" o "Zona común · Sin código" en ellas era ruido visual innecesario.

## Cambio

**`frontend/app/casero/vivienda/[id].tsx`**

Los bloques de inquilino y código de invitación se envuelven en una condición `habitacion.tipo === 'DORMITORIO'`. Solo los dormitorios muestran:
- Inquilino asignado (nombre + email) o "Sin inquilino"
- Código de invitación (revelar / copiar / compartir)

Las zonas comunes muestran únicamente el encabezado de la tarjeta (nombre + badge de tipo) y los botones de acción (Editar / Eliminar).

Se elimina también la rama `!habitacion.es_habitable → "Zona común · Sin código"`, que ya no es necesaria.

**`frontend/styles/casero/vivienda/detalle.styles.ts`**

Se elimina el estilo `zonaComun` que quedaba huérfano tras el cambio anterior.

## Decisión técnica

Se eligió condicionar por `tipo === 'DORMITORIO'` en lugar de por `es_habitable`, porque `es_habitable` es un campo editable que puede estar en `false` incluso para dormitorios (dormitorio no habitable). El tipo es la distinción semántica correcta: solo los dormitorios tienen semántica de ocupación.
