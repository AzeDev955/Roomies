# Issue #sin-numero - sincronización documental de inventario y check-in

**Fecha:** 2026-04-09
**Épica:** 11

## Cambios técnicos

- `CONTEXT.md`: añadido un addendum de Épica 11 con resumen del modelo `ItemInventario`, `FotoAsset`, endpoints de inventario y la nueva UX de check-in visual del inquilino.
- `docs/backend/api.md`: añadida una sección complementaria para `PATCH /inventario/:itemId/conformidad` y el contrato del flag `revisado_por_inquilino`.
- `docs/backend/inventario-assets.md`: ampliada la guía con el flujo de conformidad del inquilino sobre items ya fotografiados.
- `docs/backend/setup.md`: añadido un addendum corrigiendo el estado operativo real del backend, variables de Cloudinary, scripts actuales y dependencia de `backend/Dockerfile`.
- `docs/frontend/setup.md`: añadida una actualización de navegación, pantallas y tokens de tema relacionados con el inventario de casero e inquilino.
