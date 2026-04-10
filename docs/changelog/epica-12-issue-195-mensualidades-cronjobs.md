# Issue #195 — Motor de mensualidades y cronjobs

**Fecha:** 2026-04-10
**Epica:** 12

## Cambios tecnicos

- `backend/prisma/schema.prisma`: se anade el modelo `GastoRecurrente` con sus claves foraneas a `Vivienda` y `Usuario`, y se crean las relaciones inversas en `Usuario` y `Vivienda`.
- `backend/src/services/gasto.service.ts`: se extrae la logica reutilizable para validar pertenencia a vivienda, obtener inquilinos activos y crear gastos con reparto equitativo de deudas.
- `backend/src/controllers/gasto.controller.ts`: el alta de gastos puntuales pasa a reutilizar el nuevo servicio compartido.
- `backend/src/controllers/gasto-recurrente.controller.ts`: se crean los endpoints para listar y registrar gastos recurrentes por vivienda.
- `backend/src/routes/gasto-recurrente.routes.ts`: se registran las rutas `GET /:viviendaId/gastos-recurrentes` y `POST /:viviendaId/gastos-recurrentes`.
- `backend/src/cron/mensualidades.cron.ts`: se crea el cron diario de las 02:00 que busca mensualidades activas del dia y las transforma en registros normales de `Gasto`.
- `backend/src/index.ts`: se inicializa el nuevo cron de mensualidades y se monta el router de gastos recurrentes.
- `frontend/app/inquilino/(tabs)/gastos.tsx`: se anade la carga de mensualidades activas, una seccion visible de "Gastos Fijos / Mensualidades" y un modal para crear nuevas suscripciones.
- `frontend/styles/inquilino/gastos.styles.ts`: se incorporan estilos para la nueva seccion, tarjetas de mensualidades y banner informativo del modal.

## Resultado tecnico observable

- El backend puede persistir suscripciones mensuales y convertirlas automaticamente en gastos repartidos entre inquilinos activos cuando coincide el dia del mes.
- La app de inquilino puede consultar mensualidades activas y crear nuevas sin salir de la pestaña de gastos.
