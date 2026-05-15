# Issue 252 - Autenticacion, navegacion y cliente API

## Cambios

- Se centralizo la ruta de dashboard por rol para login, registro, selector de rol y restauracion de sesion.
- La restauracion de sesion elimina el token y vuelve a login cuando `/auth/me` falla o devuelve un rol no soportado.
- El cliente Axios exige `EXPO_PUBLIC_API_URL` en builds de produccion; `localhost` queda limitado a entornos no productivos.
- El perfil `production` de EAS declara explicitamente la URL publica de API y los client IDs publicos de Google.
- `useViviendaIdParam()` prioriza el segmento `/vivienda/:id` de la ruta real para evitar contaminacion de otros parametros dinamicos.

## Verificacion

- Tests unitarios para rutas por rol, URL de API y parseo de parametros dinamicos.
- Tests de render, error de login y redireccion de login por rol.
- Tests de restauracion de sesion y borrado de token cuando `/auth/me` falla.
