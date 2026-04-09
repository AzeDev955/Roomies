# Issue #194 — check-in visual y conformidad de inventario para inquilino

**Fecha:** 2026-04-09
**Épica:** 11

## Cambios técnicos

- `backend/prisma/schema.prisma`: añadido el campo `revisado_por_inquilino Boolean @default(false)` al modelo `ItemInventario` para persistir la conformidad del inquilino sobre cada elemento.
- `backend/src/controllers/inventario.controller.ts`: incorporado el controlador `marcarConformidadInventario` con validación de `itemId`, comprobación de acceso a la vivienda y actualización del flag `revisado_por_inquilino`.
- `backend/src/routes/inventario.routes.ts`: añadido el endpoint autenticado `PATCH /inventario/:itemId/conformidad`.
- `frontend/constants/theme.ts`: añadidos los tokens `Theme.colors.successLight` y `Theme.colors.dangerLight` para estados suaves y acciones destructivas con patrón Soft Tint.
- `frontend/app/inquilino/(tabs)/inventario.tsx`: creada la nueva pestaña de inventario del inquilino usando `GET /inquilino/vivienda` y `GET /viviendas/:viviendaId/inventario`, agrupando ítems por habitación o zonas comunes.
- `frontend/app/inquilino/(tabs)/inventario.tsx`: implementada galería horizontal de miniaturas por ítem, modal de revisión con foto ampliada, acción de conformidad vía `PATCH /inventario/:itemId/conformidad`, actualización local y `Toast` de éxito.
- `frontend/app/inquilino/(tabs)/inventario.tsx`: añadido flujo de discrepancia con cierre del modal y `Alert` nativo para redirigir al reporte mediante incidencias.
- `frontend/styles/inquilino/inventario.styles.ts`: definidos estilos específicos del check-in usando `Theme.radius.lg`, espaciados generosos, badge de validado con `Theme.colors.successLight` y botón destructivo en Soft Tint.
- `frontend/app/inquilino/(tabs)/_layout.tsx`: registrada la nueva pestaña `Inventario` en la navegación de inquilino.
