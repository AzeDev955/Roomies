# Epica 16 - Issue 270 - Separacion de cobros por actor

## Objetivo
Separar la logica de cobros del casero, deudas del inquilino y movimientos entre companeros para que cada usuario consulte y gestione solo el flujo economico que le corresponde.

## Cambios
- Se anade `TipoGasto` al modelo Prisma con `ENTRE_COMPANEROS`, `FACTURA_PUNTUAL`, `FACTURA_MENSUAL` y `CARGO_RECURRENTE`.
- Se incluye migracion SQL para tipar datos existentes: los gastos pagados por el casero pasan a `FACTURA_PUNTUAL` y el resto queda como `ENTRE_COMPANEROS`.
- Los gastos creados por inquilinos quedan marcados como `ENTRE_COMPANEROS`; las facturas puntuales del casero quedan como `FACTURA_PUNTUAL`.
- Las mensualidades recurrentes se guardan y generan como `FACTURA_MENSUAL`.
- El dashboard de cobros del casero filtra por tipos del casero y deja fuera los gastos entre companeros.
- La lista de gastos del inquilino restringe los movimientos y deudas embebidas a su participacion directa.
- La API de deudas devuelve `categoria` para distinguir `CASERO` y `COMPANEROS` sin inferir por IDs en frontend.
- La seed demo marca explicitamente gastos entre inquilinos, facturas puntuales y recurrentes.

## Verificacion
- Tests unitarios de tipo por defecto en gastos entre companeros.
- Tests unitarios de factura del casero con tipo explicito.
- Tests unitarios de filtros del casero, del inquilino y del dashboard de cobros.

## Riesgos conocidos
- La clasificacion historica asume que los gastos cuyo pagador es el casero pertenecen al flujo de facturacion del propietario.
