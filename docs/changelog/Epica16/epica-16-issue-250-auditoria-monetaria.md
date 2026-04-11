# Epica 16 - Issue 250 - Auditoria monetaria

## Objetivo
Revisar pagos, gastos, deudas, cobros y calculos monetarios para reducir riesgos de descuadres, estados falsamente vacios y ediciones inseguras sobre importes ya pagados.

## Cambios
- El reparto de gastos normaliza los importes a centimos antes de guardar o comparar.
- El reparto automatico reparte el resto centimo a centimo entre participantes, de forma determinista.
- El reparto manual valida suma exacta en centimos, usuarios duplicados, usuarios ajenos y cuotas negativas.
- Las cuotas manuales a `0` son validas y no generan deudas de importe cero.
- La edicion de facturas abiertas redistribuye deudas en centimos exactos cuando cambia el importe.
- La edicion del importe queda bloqueada si alguna deuda asociada ya figura como `PAGADA`.
- El dashboard de cobros suma pagado y pendiente en centimos para evitar acumulaciones flotantes.
- Las pantallas de cobros del casero y gastos del inquilino muestran un estado de error inline si falla la API, sin presentar datos mock ni vacios engañosos.

## Precision monetaria
El modulo sigue usando `Float` en Prisma por compatibilidad con el MVP y con los datos existentes, pero las operaciones auditadas convierten los importes a centimos con `Math.round((importe + Number.EPSILON) * 100)` antes de repartir, comparar o sumar. La decision mantiene la API actual y reduce los descuadres visibles; una migracion completa a `Decimal` o a centimos enteros queda como mejora futura porque exige coordinar schema, seed, API, frontend y datos ya persistidos.

## Verificacion
- Tests unitarios de reparto automatico con importes que no dividen exacto.
- Tests unitarios de reparto manual con suma correcta, suma incorrecta, usuario duplicado, usuario ajeno y cuota cero.
- Tests unitarios de saldar deuda solo por deudor.
- Tests unitarios de edicion bloqueada si hay pagos registrados.

## Riesgos conocidos
- La representacion persistida continua siendo `Float`; las rutas criticas normalizan a centimos en codigo, pero el cambio estructural a `Decimal` o enteros deberia planificarse como migracion propia.
