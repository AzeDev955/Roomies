# Issue #222 - Editar facturas mensuales generadas

**Fecha:** 2026-04-10
**Epica:** 14 - Facturacion flexible y precios privados

## Cambios tecnicos

- `backend/src/controllers/gasto.controller.ts`: anade `actualizarGasto` para editar concepto, importe y fecha de un gasto de vivienda validando permisos de casero.
- `backend/src/controllers/gasto.controller.ts`: bloquea cambios de importe cuando alguna deuda asociada esta `PAGADA` y permite concepto/fecha aunque existan pagos registrados.
- `backend/src/controllers/gasto.controller.ts`: recalcula deudas hijas pendientes repartiendo el nuevo importe entre las deudas del gasto dentro de una transaccion.
- `backend/src/routes/gasto.routes.ts`: registra `PATCH /api/viviendas/:viviendaId/gastos/:gastoId` protegido por token y modulo de gastos.
- `backend/src/controllers/cobros.controller.ts`: incluye `gasto.importe` en el dashboard de cobros para poder editar facturas desde la UI.
- `backend/prisma/schema.prisma`: anade `factura_url` opcional al modelo `Gasto` para guardar la imagen de la factura.
- `backend/src/config/cloudinary.config.ts`: anade uploader `uploadFacturaFoto` en la carpeta `roomies-facturas`.
- `backend/src/controllers/gasto.controller.ts`: anade `subirFacturaGasto` para subir o reemplazar la imagen de factura validando propietario y Cloudinary.
- `backend/src/routes/gasto.routes.ts`: registra `POST /api/viviendas/:viviendaId/gastos/:gastoId/factura` con `multipart/form-data` en el campo `factura`.
- `frontend/app/casero/(tabs)/cobros.tsx`: anade seccion de facturas emitidas agrupadas por gasto, boton de editar y modal pre-rellenado con concepto e importe.
- `frontend/app/casero/(tabs)/cobros.tsx`: deshabilita el importe si existe alguna deuda `PAGADA`, muestra aviso preventivo y actualiza el estado local tras el PATCH.
- `frontend/app/casero/(tabs)/cobros.tsx`: permite subir, reemplazar y visualizar la foto de la factura desde el modal de edicion y desde la tarjeta.
- `frontend/styles/casero/cobros.styles.ts`: incorpora estilos para tarjetas de factura, accion de edicion y banner de advertencia con `Theme.radius.lg`.
- `frontend/constants/theme.ts`: anade `warningLight` para avisos suaves.
- `docs/backend/api.md`: documenta los endpoints de edicion/subida de factura y los campos `gasto.importe`/`gasto.factura_url` en cobros.

## Validacion

- `backend`: `npm run build`.
- `frontend`: `npx tsc --noEmit`.
- `frontend`: `npm run lint` sin errores; persisten warnings previos en pantallas no tocadas.
