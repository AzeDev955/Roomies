# Infra - Docker en desarrollo y Railway en main

## Objetivo

Reducir costes de Railway evitando despliegues de desarrollo y recuperar Docker Compose como flujo principal para cambios diarios.

## Cambios principales

- `docker-compose.yml` deja de usar Railway desarrollo como fallback de `EXPO_PUBLIC_API_URL` y apunta a `http://localhost:3001/api`.
- `frontend/.env.example`, `README.md`, `docs/frontend/setup.md`, `docs/infra/setup-despliegue.md`, `docs/backend/setup.md` y `CONTEXT.md` documentan Docker local para desarrollo y Railway solo para produccion desde `main`.
- `frontend/utils/apiUrl.ts` y sus tests usan `http://localhost:3001/api` como fallback local, alineado con el puerto publicado por Compose.
- `backend/scripts/start.js` deja de ejecutar seed automaticamente por nombre de entorno Railway; solo lo hace con `ROOMIES_SEED_ON_START=true`.
- `dev.bat` levanta los contenedores con `docker compose up --build -d --force-recreate` desde la raiz, avisa si falta `.env`, espera a `/ping` y ejecuta `npx expo start --clear` en `frontend`.
- `docker-compose.yml` reinicia la BD con `prisma db push --force-reset` y ejecuta seed en cada arranque del backend de desarrollo.

## Verificacion

- `docker compose config --quiet`.
- `npm test -- apiUrl.test.ts --runInBand` en `frontend`.
- `cmd /c dev.bat` valida el wrapper; en esta maquina se detiene correctamente avisando que Docker Desktop no esta arrancado.
- `docker compose up --build -d` levanta `db`, `backend` y `frontend` con Docker Desktop activo.
- `Invoke-WebRequest http://localhost:3001/ping` devuelve `200 OK` con cuerpo `pong`.
- `docker compose up --build -d --force-recreate` recrea contenedores, reinicia schema con `force-reset` y ejecuta seed antes de arrancar backend.
- `Invoke-RestMethod` contra `POST /api/auth/login` con `casero@example.test / pass` devuelve token.
- `npx expo --version` en `frontend` resuelve correctamente el CLI local.
