# Issue 276 - terminos de uso y politica de privacidad

## Cambios principales

- Se anaden documentos legales versionados en `frontend/constants/legal.ts` para terminos de uso y politica de privacidad.
- Se crean pantallas de lectura dedicadas en `frontend/app/legal/terminos.tsx` y `frontend/app/legal/privacidad.tsx`, con una vista compartida preparada para futuras revisiones.
- Se incorpora `LegalNotice` como bloque reutilizable para mostrar enlaces legales y, cuando aplica, aceptacion explicita mediante checkbox accesible.
- El flujo de registro manual exige aceptar la documentacion legal antes de completar el alta.
- El flujo de alta de usuarios nuevos que vienen de Google exige la misma aceptacion en `frontend/app/rol.tsx`.
- Login y perfil muestran accesos claros para consultar ambos documentos desde la app.

## Verificacion prevista

- Mantener enlaces visibles en login, registro, alta inicial y perfil.
- Mantener version y fecha visibles en los documentos.
- Dejar el texto preparado para revisiones legales posteriores sin acoplarlo al backend actual.
