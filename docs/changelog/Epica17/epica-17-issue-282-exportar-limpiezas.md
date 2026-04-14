# Epica 17 - Issue 282 - Exportar limpiezas a Excel

## Objetivo

Permitir exportar los turnos de limpieza visibles para el usuario en un archivo CSV compatible con Excel, respetando permisos de vivienda, módulo activo y filtros de la pantalla.

## Cambios

- Backend: nuevo `GET /api/viviendas/:id/limpieza/turnos/export` protegido por token y `mod_limpieza`.
- Backend: exportación CSV con cabeceras comprensibles, nombre de archivo con fecha y soporte de filtros `fecha`, `fechaDesde`, `fechaHasta` y `estado`.
- Backend: respuesta `404` clara cuando no hay limpiezas para exportar y validación `400` para filtros inválidos.
- Frontend casero: botón `Exportar` en el calendario de limpieza y filtro por estado para exportar el listado actual.
- Frontend casero: descarga web mediante Blob y guardado/compartición nativa mediante `expo-file-system` y `Share`.
- Tests: cobertura de permiso multitenant, CSV generado y ausencia de datos para exportación.

## Notas

- El formato elegido es CSV porque Excel lo abre correctamente y evita introducir una dependencia pesada de XLSX.
- El modelo actual de limpieza no guarda observaciones ni fecha de validación; esas columnas quedan preparadas en el CSV para mantener el contrato de exportación estable.

## Fix posterior

- El frontend usa fechas locales `YYYY-MM-DD` al cargar y exportar turnos para evitar saltos de semana por conversión UTC.
- En Android, el CSV se guarda mediante Storage Access Framework para que el usuario elija carpeta y el archivo quede accesible.
- La acción de exportar ya no se limita a la semana visible: exporta el calendario completo de la vivienda, aplicando solo el filtro de estado si el usuario lo selecciona.
- Las cabeceras del CSV usan español con acentos, incluyendo `Habitación o zona` y `Fecha de validación`.
