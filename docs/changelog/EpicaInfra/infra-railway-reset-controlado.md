# Infra - reset controlado de Prisma en Railway

## Objetivo
Permitir recuperar despliegues de Railway cuando `prisma db push` no puede aplicar cambios incompatibles sobre filas existentes y la base de datos del entorno se puede descartar.

## Cambios
- `backend/scripts/start.js`: acepta `ROOMIES_PRISMA_FORCE_RESET_ON_START=true` para ejecutar `prisma db push --force-reset --accept-data-loss` antes de arrancar el backend compilado.
- `backend/scripts/start.js`: omite el seed automatico en produccion y Railway no-dev aunque `ROOMIES_SEED_ON_START=true` haya quedado definido.
- `backend/prisma/seed.ts`: elimina el override de seed demo en produccion.
- `docker-compose.yml`, `.env.example` y `backend/.env.example`: declaran el entorno local como `development` para conservar el seed demo de Docker.
- `README.md`, `docs/backend/setup.md` y `docs/infra/setup-despliegue.md`: documentan el uso temporal y destructivo de la variable en Railway.
