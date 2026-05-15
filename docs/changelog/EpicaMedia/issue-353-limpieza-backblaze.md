# Issue 353 - Limpieza de objetos Backblaze

## Objetivo

Evitar objetos huerfanos en Backblaze B2 cuando Roomies sustituye o elimina referencias de media persistidas en base de datos.

## Cambios

- Se anade `media-cleanup.service` para borrar objetos Backblaze de forma best-effort y registrar fallos controlados sin exponer credenciales.
- Las nuevas variantes de imagen comparten un `variantGroupId` en la key, lo que permite inferir `thumb`, `medium` y `large` desde la variante persistida.
- Al sustituir facturas y justificantes se limpia la referencia anterior tras actualizar la base de datos.
- Al borrar una factura puntual se limpia su factura asociada.
- Se expone borrado de items de inventario con limpieza de fotos asociadas.

## Estrategia ante fallos

La base de datos queda como fuente de verdad: primero se completa la mutacion funcional y despues se intenta borrar Backblaze. Si el proveedor falla, la respuesta marca `media_cleanup_pending` en borrados explicitos y el backend deja un log con proveedor, key y codigo de error para limpieza posterior.

## Limpieza manual en desarrollo

Para objetos huerfanos en desarrollo, filtrar por prefijos funcionales (`inventory-photo/`, `expense-invoice/`, `payment-proof/`, `rental-contract/`) en el bucket B2 y comparar con las columnas `*_provider = backblaze` y `*_key` de la base de datos local antes de eliminar.
