# Epica 17 - Issue 277 - validacion de inventario por inquilino

## Objetivo

Hacer visible para el casero la conformidad del inquilino sobre cada item de inventario y cerrar el hueco de permisos que permitia listar o validar elementos de otras habitaciones dentro de la misma vivienda.

## Cambios principales

- `backend/prisma/schema.prisma`: se amplia `ItemInventario` con `revisado_por_inquilino_id` y `revisado_por_inquilino_en`, enlazando la validacion con el usuario que la hizo y el instante en que se registro.
- `backend/src/controllers/inventario.controller.ts`: el listado para inquilino ahora solo devuelve items de su habitacion y de zonas comunes, y la conformidad rechaza intentos sobre habitaciones ajenas aunque pertenezcan a la misma vivienda.
- `backend/src/controllers/inventario.controller.ts`: la conformidad pasa a ser idempotente para el mismo inquilino y bloquea sobrescrituras cuando un item comun ya fue validado por otra persona.
- `frontend/app/casero/(tabs)/inventario.tsx`: la vista del casero muestra estados `Validado`, `Pendiente` y `No aplica`, junto con el nombre del inquilino validador y la fecha cuando existe.
- `frontend/styles/casero/inventario.styles.ts`: se incorporan badges semanticos para el estado de revision y nuevos indicadores resumen en la hero card.
- `backend/tests/inventario-issue-277.test.ts`: se anaden pruebas dirigidas para filtrar el inventario del inquilino y bloquear la conformidad forzada sobre otra habitacion.

## Verificacion

- `backend`: ejecutar `npm test -- inventario-issue-277.test.ts` para cubrir el filtrado por habitacion y el veto a la conformidad cruzada.
