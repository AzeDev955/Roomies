# Issue #187 — Motor de Gastos y Balances

**Fecha:** 2026-04-09
**Épica:** 10 — Motor de Gastos y Balances

## Qué se hizo

- Añadido enum `EstadoDeuda` (`PENDIENTE`, `PAGADA`) en `schema.prisma`
- Creado modelo `Gasto` con campos: `id`, `concepto`, `importe`, `fecha_creacion`, `pagador_id` (FK Usuario), `vivienda_id` (FK Vivienda)
- Creado modelo `Deuda` con campos: `id`, `gasto_id` (FK Gasto), `deudor_id` (FK Usuario), `acreedor_id` (FK Usuario), `importe`, `estado` (default PENDIENTE)
- Añadidas relaciones inversas en `Usuario`: `gastos_pagados`, `deudas_a_pagar` (@relation "DeudorDeuda"), `deudas_a_cobrar` (@relation "AcreedorDeuda")
- Añadida relación inversa `gastos` en `Vivienda`
- Creado `backend/src/controllers/gasto.controller.ts` con handler `crearGasto`:
  - Verifica que el pagador pertenece a la vivienda (tiene habitación asignada)
  - Obtiene todos los inquilinos actuales de la vivienda
  - Divide el importe equitativamente entre el total de inquilinos
  - Ejecuta `prisma.$transaction` para crear el `Gasto` y todas las `Deuda`s en una sola operación atómica (el pagador no genera deuda consigo mismo)
- Creado `backend/src/routes/gasto.routes.ts` con `POST /viviendas/:viviendaId/gastos` protegido por `verificarToken`
- Registrado `gastoRoutes` en `backend/src/index.ts` bajo `/api/viviendas`
