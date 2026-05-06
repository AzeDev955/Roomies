# Issue 337 - Contratos de alquiler y firma interna

## Objetivo

Se anade un flujo operativo para que el casero suba contratos de alquiler por vivienda/habitacion y el inquilino pueda revisarlos, firmarlos o rechazarlos desde la app.

## Cambios principales

- Nuevo modelo `ContratoAlquiler` con estados `BORRADOR`, `PENDIENTE_FIRMA`, `FIRMADO`, `RECHAZADO` y `ANULADO`.
- Nuevo modelo `EventoContratoAlquiler` para conservar trazabilidad de version, hash, usuario, estado y origen tecnico.
- Endpoints protegidos para listar contratos por vivienda, crear nuevas versiones, firmar, rechazar y anular.
- Subida de PDF o imagen mediante Cloudinary en la carpeta `roomies-contratos`.
- La foto fiscal de ocupacion puede consumir contratos firmados como fuente de periodos, renta e inquilino.
- Nuevas pantallas de contratos para casero e inquilino, con aviso de alcance legal de la firma interna.

## Verificacion

- `npm test -- contrato-issue-337.test.ts fiscal.service.test.ts`
- `npm run build` en backend
- `npx tsc --noEmit` en frontend queda bloqueado por errores preexistentes en `app/casero/vivienda/[id]/(tabs)/limpieza.tsx`.
