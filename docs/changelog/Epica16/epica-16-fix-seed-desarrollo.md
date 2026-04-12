# Epica 16 - Fix seed automatico en desarrollo

## Objetivo

Recuperar el seed automatico del backend en Railway desarrollo tras la revision de infraestructura, manteniendo bloqueados los datos demo en produccion.

## Cambios

- `backend/scripts/start.js`: nuevo runner de arranque para aplicar `prisma db push`, ejecutar `prisma db seed` en Railway desarrollo detectado por `RAILWAY_ENVIRONMENT_NAME` (`development`, `dev` o `desarrollo`) o con `ROOMIES_SEED_ON_START=true`, y levantar `dist/index.js`.
- `backend/package.json`: `npm start` pasa a usar el runner de arranque.
- `backend/prisma/seed.ts`: el guard permite Railway `development` y sigue bloqueando produccion o entornos Railway no desarrollo salvo override explicito.
- `README.md`, `CONTEXT.md`, `docs/backend/setup.md` y `docs/infra/setup-despliegue.md`: documentan el comportamiento real del seed automatico.

## Verificacion esperada

- `npm run build` en `backend`.
- `npm test` en `backend`.
