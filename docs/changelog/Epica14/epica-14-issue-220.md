# Issue #220 - Facturas puntuales con reparto manual

**Fecha:** 2026-04-10
**Epica:** 14

## Cambios tecnicos

- `backend/prisma/schema.prisma`: usado `Gasto.factura_url` para conservar la factura original de un gasto puntual, compatible con el campo compartido por la edicion de facturas mensuales.
- `backend/src/config/cloudinary.config.ts`: anadido uploader `uploadFacturaGasto` para imagenes y PDF en Cloudinary.
- `backend/src/routes/gasto.routes.ts`: el endpoint `POST /api/viviendas/:viviendaId/gastos` acepta ahora `multipart/form-data` con campo `factura`.
- `backend/src/controllers/gasto.controller.ts`: normaliza importes desde JSON o form-data, valida `repartoManual`, acepta `fecha` y permite crear gastos al casero propietario.
- `backend/src/services/gasto.service.ts`: crea deudas con importes exactos de `repartoManual` si la suma en centimos coincide con el total del gasto.
- `backend/src/controllers/cobros.controller.ts`: expone `gasto.factura_url` en el dashboard de cobros.
- `frontend/app/casero/(tabs)/cobros.tsx`: anadido modal de nueva factura puntual con adjunto opcional, reparto por inquilino activo y validacion en tiempo real.
- `frontend/styles/casero/cobros.styles.ts`: estilos del modal, contador de reparto, boton secundario y enlace a factura original con tokens `Theme`.
- `frontend/app/inquilino/(tabs)/gastos.tsx`: las deudas muestran enlace a "Ver factura original" cuando el gasto incluye factura.
- `frontend/styles/inquilino/gastos.styles.ts`: estilos del enlace de factura original en tarjetas de deuda.
- `frontend/package.json` y `frontend/package-lock.json`: anadida dependencia `expo-document-picker` para adjuntar imagenes o PDF.

## Validacion

- `npm run build` en `backend`.
- `npx tsc --noEmit` en `frontend`.
