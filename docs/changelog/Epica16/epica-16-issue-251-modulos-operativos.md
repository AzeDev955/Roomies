# Epica 16 - Issue 251 - Modulos operativos

## Objetivo
Revisar los modulos operativos de convivencia con foco en permisos, estados, uploads y notificaciones para que los flujos criticos fallen de forma segura y queden cubiertos por tests.

## Cambios
- Se anade un manejador global de errores de subida para devolver JSON estable en tipos no permitidos y archivos demasiado grandes.
- Se cubre la generacion semanal de turnos de limpieza, el avance de semana y la actualizacion de balances.
- Se anaden tests de modulos desactivados para limpieza, inventario y gastos.
- Se cubren accesos negativos a inventario ajeno y cambios de estado de incidencias fuera de pertenencia.
- Se verifican errores de proveedor Cloudinary no configurado, tipo de archivo invalido y limite de tamano.
- Se valida que una notificacion push fallida no rompe la creacion principal de un anuncio.

## Verificacion
- `npm test`
- `npm run build`

## Riesgos conocidos
- Las pruebas de upload validan el middleware y el manejo de errores sin conectar contra Cloudinary real.
