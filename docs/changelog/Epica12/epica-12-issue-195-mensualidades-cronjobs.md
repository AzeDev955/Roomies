# Issue #195 - Motor de mensualidades y cronjobs

**Fecha:** 2026-04-10
**Epica:** 12

## Cambios tecnicos

- `backend/prisma/schema.prisma`: se mantiene el modelo `GastoRecurrente` como base del flujo de mensualidades ligado a `Vivienda` y `Usuario`.
- `backend/src/services/gasto.service.ts`: la logica compartida de reparto ahora permite que el casero actue como pagador y acreedor de mensualidades sin requerir habitacion asignada, manteniendo el reparto solo entre inquilinos activos.
- `backend/src/controllers/gasto-recurrente.controller.ts`: los endpoints de listar y crear gastos recurrentes pasan a estar restringidos al casero propietario de la vivienda.
- `backend/src/routes/gasto-recurrente.routes.ts`: se conserva la exposicion de `GET /:viviendaId/gastos-recurrentes` y `POST /:viviendaId/gastos-recurrentes` con la nueva validacion de permisos.
- `backend/src/cron/mensualidades.cron.ts`: el cron diario sigue transformando mensualidades activas en gastos normales reutilizando la logica comun de reparto.
- `frontend/app/inquilino/(tabs)/gastos.tsx`: se elimina la carga, la lista y el modal de mensualidades para que el inquilino no pueda ver ni crear gastos recurrentes desde su tab.
- `frontend/app/casero/vivienda/[id]/(tabs)/index.tsx`: el alta y la consulta de mensualidades se recolocan en el resumen de cada vivienda del casero para operar con el identificador de casa correcto.
- `frontend/styles/inquilino/gastos.styles.ts`: se limpian los estilos huertanos asociados a la antigua seccion de mensualidades del inquilino.

## Resultado tecnico observable

- El backend puede generar mensualidades cuyo acreedor es el casero y repartir automaticamente la deuda entre los inquilinos activos cuando llega el dia configurado.
- Los inquilinos dejan de tener acceso visual y funcional al flujo de mensualidades dentro de la app.
