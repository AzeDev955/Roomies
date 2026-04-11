# Epica 16 - Issue 249 - Modelo Prisma, seed y consistencia de datos

## Objetivo
Revisar el modelo de datos, seed y documentacion backend para reducir incoherencias relacionales, evitar datos demo fuera de entorno local y dejar validaciones repetibles sobre el schema.

## Cambios
- `Habitacion.inquilino_id` pasa a ser unico cuando tiene valor, manteniendo habitaciones vacias y zonas comunes con `NULL`.
- `Deuda` queda protegida con `@@unique([gasto_id, deudor_id])` y cascada desde `Gasto`.
- `FotoAsset`, `AsignacionLimpiezaFija` y `TurnoLimpieza` se borran en cascada desde su padre directo.
- `Incidencia.habitacion` y `Habitacion.inquilino` usan `SetNull` para conservar historico si se elimina la entidad relacionada.
- El seed usa emails `example.test`, constantes para credenciales locales y bloqueo en produccion/Railway salvo override explicito.
- Docs backend corrigen mojibake localizado y documentan constraints, cascadas y la decision de mantener `Float` por compatibilidad MVP.
- Se anade un test estatico para detectar mojibake y validar relaciones criticas del schema.

## Verificacion
- `npx prisma validate --schema prisma/schema.prisma`
- `npm test`
- `npm run build`

## Riesgos conocidos
- La migracion a `Decimal` o centimos enteros queda aplazada porque requiere coordinar API, frontend y datos existentes.
- Si una base existente contiene un mismo inquilino asignado a varias habitaciones o deudas duplicadas por gasto/deudor, habra que limpiar esos datos antes de aplicar el nuevo constraint.
