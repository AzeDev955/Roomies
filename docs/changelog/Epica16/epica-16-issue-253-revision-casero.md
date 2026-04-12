# Epica 16 - Issue 253 - Revision de pantallas del casero

## Objetivo
Auditar pantallas del casero para mejorar la gestion de parametros dinamicos, estados visuales y consistencia de estilos sin cambiar los contratos de API existentes.

## Cambios
- Se anade un helper compartido para normalizar parametros de ruta, parsear ids positivos y leer arrays JSON de forma defensiva.
- Los formularios de crear/editar habitacion y nueva incidencia muestran un estado de error navegable cuando el enlace no contiene una vivienda o habitacion valida.
- El perfil de inquilino visto por casero valida el id, deja de renderizar una pantalla vacia en error y usa iconos `Ionicons` en los datos de contacto.
- Se sustituyen colores literales en spinners y superficies del detalle de vivienda por tokens de `Theme`.
- Se suavizan estados visuales de limpieza y detalle de vivienda con tints semanticos del tema.

## Verificacion
- `npm run lint`
- `npx tsc --noEmit`

## Riesgos conocidos
- El lint sigue mostrando warnings heredados en incidencias, limpieza y pantallas compartidas; no bloquean compilacion y quedan fuera del alcance del parche funcional.
