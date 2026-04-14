# Epica 17 - Issue 282 - Exportar limpiezas a Excel

## Objetivo

Permitir exportar los turnos de limpieza visibles para el usuario en un archivo CSV compatible con Excel, respetando permisos de vivienda, modulo activo y filtros de la pantalla.

## Cambios

- Backend: nuevo `GET /api/viviendas/:id/limpieza/turnos/export` protegido por token y `mod_limpieza`.
- Backend: exportacion CSV con cabeceras comprensibles, nombre de archivo con fecha y soporte de filtros `fecha`, `fechaDesde`, `fechaHasta` y `estado`.
- Backend: respuesta `404` clara cuando no hay limpiezas para exportar y validacion `400` para filtros invalidos.
- Frontend casero: boton `Exportar` en el calendario de limpieza y filtro por estado para exportar el listado actual.
- Frontend casero: descarga web mediante Blob y guardado/comparticion nativa mediante `expo-file-system` y `Share`.
- Tests: cobertura de permiso multitenant, CSV generado y ausencia de datos para exportacion.

## Notas

- El formato elegido es CSV porque Excel lo abre correctamente y evita introducir una dependencia pesada de XLSX.
- El modelo actual de limpieza no guarda observaciones ni fecha de validacion; esas columnas quedan preparadas en el CSV para mantener el contrato de exportacion estable.
