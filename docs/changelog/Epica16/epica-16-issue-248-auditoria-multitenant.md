# Epica 16 - Issue 248 - Auditoria multi-tenant y proteccion de datos

## Objetivo
Cerrar fugas de datos entre viviendas y dejar tests negativos de regresion para los endpoints sensibles de viviendas, habitaciones, incidencias, anuncios, codigos de invitacion y guardas de modulos.

## Cambios
- Los inquilinos ya no reciben `codigo_invitacion` en `GET /api/inquilino/vivienda` ni en la respuesta de `POST /api/inquilino/unirse`.
- `protegerModuloVivienda()` valida pertenencia antes de devolver si un modulo esta activo o desactivado, evitando revelar estado de viviendas ajenas.
- El borrado de anuncios exige que el autor siga perteneciendo a la vivienda, o que el usuario sea el casero propietario.
- Se anade `npm test` en backend con una suite de regresion multi-tenant basada en `node --test` y `ts-node`, sin dependencias nuevas.

## Verificacion
- `npm test` en `backend`.
- `npm run build` en `backend`.
