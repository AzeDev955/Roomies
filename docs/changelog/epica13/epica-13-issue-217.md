# Issue #217 — modulos configurables por vivienda

**Fecha:** 2026-04-10
**Epica:** 13

## Cambios tecnicos

- `backend/prisma/schema.prisma`: anadidos `mod_limpieza`, `mod_gastos` y `mod_inventario` en `Vivienda` con `@default(true)`.
- `backend/src/middlewares/module.guard.ts`: creado guard reutilizable para bloquear con 403 los modulos desactivados por vivienda, incluyendo resolvers para item de inventario y deuda.
- `backend/src/controllers/vivienda.controller.ts`: expuesto `PATCH /viviendas/:id` para actualizar flags de modulos solo por el casero propietario.
- `backend/src/routes/limpieza.routes.ts`: protegido el modulo de limpieza en zonas, turnos y asignaciones.
- `backend/src/routes/gasto.routes.ts`: protegido el modulo de gastos en gastos, deudas, cobros y saldado.
- `backend/src/routes/gasto-recurrente.routes.ts`: protegido el modulo de gastos en mensualidades recurrentes.
- `backend/src/routes/deuda.routes.ts`: protegido el modulo de gastos antes de subir justificantes de deuda.
- `backend/src/routes/inventario.routes.ts`: protegido el modulo de inventario en alta, listado, conformidad y subida de fotos.
- `backend/src/routes/vivienda.routes.ts`: registrada la ruta `PATCH /viviendas/:id`.
- `frontend/app/casero/vivienda/[id]/(tabs)/index.tsx`: anadida seccion "Configuracion de Modulos" con switches y actualizacion PATCH.
- `frontend/styles/casero/vivienda/detalle.styles.ts`: estilos de tarjetas de modulos con `Theme.radius.lg`, `Theme.shadows.sm` y superficies blancas.
- `frontend/app/casero/(tabs)/_layout.tsx`: ocultacion condicional de tabs globales de Cobros e Inventario segun viviendas con modulo activo.
- `frontend/app/casero/vivienda/[id]/(tabs)/_layout.tsx`: ocultacion condicional de la tab Limpieza segun la vivienda abierta.
- `frontend/app/inquilino/(tabs)/_layout.tsx`: ocultacion condicional de Limpieza, Gastos e Inventario segun la vivienda del inquilino.

## Validacion

- `backend`: `npm run build`.
- `frontend`: `npm run lint` sin errores bloqueantes; quedan warnings preexistentes del proyecto.
