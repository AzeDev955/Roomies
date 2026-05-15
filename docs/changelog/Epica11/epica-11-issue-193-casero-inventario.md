# Issue #193 — Casero: configuración de inventario

**Fecha:** 2026-04-09
**Épica:** 11 — Inventario y Estado de la Vivienda

## Cambios técnicos

- `backend/src/controllers/inventario.controller.ts`: añade `crearItemInventario` con validación XOR entre `habitacion_id` y `vivienda_id`, restringe la creación al casero propietario y expone `listarInventarioVivienda` con `habitacion` y `fotos[]`.
- `backend/src/routes/inventario.routes.ts`: registra `POST /viviendas/:viviendaId/inventario`, `GET /viviendas/:viviendaId/inventario` y mantiene `POST /inventario/:itemId/fotos`.
- `backend/src/index.ts`: cambia el montaje del router de inventario a `/api` para servir simultáneamente las rutas bajo `/viviendas/...` y `/inventario/...`.
- `frontend/app/casero/(tabs)/_layout.tsx`: incorpora la pestaña `Inventario` en la navegación global del casero.
- `frontend/app/casero/(tabs)/inventario.tsx`: crea la pantalla principal del inventario del casero con selector de vivienda, agrupado por ubicación, listado de items, modal de alta y flujo de subida inmediata de foto tras crear el item.
- `frontend/styles/casero/inventario.styles.ts`: define la capa visual de la pantalla usando tokens de `Theme`, soft tints semánticos por estado y bottom sheet con bordes redondeados.
- `frontend/package.json`: añade `expo-image-picker` para abrir la galería del móvil desde el formulario de inventario.
- `frontend/package-lock.json`: sincroniza el lockfile con la nueva dependencia de selección de imágenes.
- `docs/backend/api.md`: documenta los endpoints `POST/GET /viviendas/:viviendaId/inventario`.
- `docs/backend/inventario-assets.md`: amplía la guía de Cloudinary con el flujo completo crear-item → subir-foto → refrescar listado.
- `CONTEXT.md`: registra el nuevo módulo de inventario del casero, sus endpoints y el uso de `expo-image-picker`.

## Resultado técnico

- El casero puede crear items de inventario por habitación o por zonas comunes.
- El backend devuelve el inventario de una vivienda con sus fotos y relación de habitación lista para renderizar.
- El frontend muestra el inventario agrupado por ubicación, con estados semánticos suaves y miniatura cuando hay foto.
- El alta de un item puede incluir selección de imagen desde galería y subida inmediata a Cloudinary.

## Validación

- `frontend`: `npm run lint` sin errores nuevos; quedan solo warnings previos del proyecto.
- `frontend`: `npx tsc --noEmit` correcto.
- `backend`: `npx tsc --noEmit` sigue fallando por errores previos en `src/controllers/gasto.controller.ts`; no aparecieron errores de `inventario.controller.ts`, `inventario.routes.ts` ni `src/index.ts` en la revisión dirigida.
