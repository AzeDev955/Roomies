# Issue #108 — Tablón de anuncios por vivienda (Frontend)

## Cambios

### Pantalla nueva: `app/tablon/[viviendaId].tsx`

Pantalla compartida para casero e inquilinos. Acepta los query params:
- `esCasero=true` — si viene del casero, puede eliminar cualquier anuncio
- `miUsuarioId=X` — si viene del inquilino, solo puede eliminar sus propios anuncios

Funcionalidades:
- `FlatList` con tarjetas: título, contenido, nombre del autor, fecha formateada (`2 abr 2026`)
- Botón `✕` en tarjetas donde el usuario tiene permiso de eliminar → `Alert` de confirmación → `DELETE /anuncios/:id`
- FAB `+` abre un `Modal` bottom-sheet con formulario de nuevo anuncio
- Modal: campo `titulo` (max 100), campo `contenido` multilinea (max 500), botones Cancelar/Publicar
- Al publicar con éxito → `setAnuncios(prev => [data, ...prev])` (actualización optimista sin reload)
- `KeyboardAvoidingView` en el modal para que el teclado no tape el formulario

### Estilos: `styles/tablon/tablon.styles.ts`

Nuevo archivo de estilos con: `card`, `cardHeader`, `cardTitulo`, `eliminarBtn`, `cardContenido`, `cardFooter`, `cardAutor`, `cardFecha`, `fab`, `fabTexto`, `modalOverlay`, `modalContainer`, `modalTitulo`, `inputTitulo`, `inputContenido`, `modalAcciones`, `botonCancelar`, `botonPublicar`, `botonPublicarDisabled`.

### Casero: `app/casero/vivienda/[id].tsx`

Añadido enlace "Tablón de anuncios →" bajo "Ver todas las incidencias →", navega a `/tablon/${id}?esCasero=true`.

### Inquilino: `app/inquilino/inicio.tsx`

Añadido enlace "Tablón de anuncios →" entre la sección de zonas comunes e incidencias, navega a `/tablon/${viviendaId}?miUsuarioId=${miUsuarioId}`.

### Estilos: `styles/inquilino/inicio.styles.ts`

Añadidos `enlaceTablon` y `enlaceTablonTexto`.

### Documentación: `docs/frontend/setup.md`

Nueva ruta `/tablon/:viviendaId` añadida en la estructura de la app, la tabla de pantallas y la sección de estilos.
