# Issue #235 - Perfil de casero como Propietario

**Fecha:** 2026-04-11
**Epica:** 15 - Pulido de casero en vivienda y gastos comunes

## Cambios tecnicos

- `frontend/app/perfil.tsx`: el badge visible del perfil muestra `Propietario` para usuarios con rol `CASERO`.
- `frontend/app/perfil.tsx`: se elimina la tarjeta redundante de `Rol` del perfil compartido.
- El perfil del inquilino mantiene su identidad visible mediante el badge `Inquilino`, sin mostrar un campo de rol adicional.

## Validacion

- `frontend`: `npm run lint` sin errores; persisten warnings existentes del proyecto.
- `frontend`: `npx tsc --noEmit` sin errores.
