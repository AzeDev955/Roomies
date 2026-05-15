# Issue #256 - Infraestructura, entornos, despliegue y documentacion

## Objetivo

Dejar documentado y alineado el flujo real para instalar, ejecutar, probar y desplegar Roomies, reduciendo sorpresas entre desarrollo local, Docker Compose y Railway.

## Cambios

- `docker-compose.yml`: el frontend deja de apuntar siempre a produccion y toma `EXPO_PUBLIC_API_URL` desde `.env`; se pasan al backend las variables de email, Cloudinary, `BACKEND_URL` y `RESET_DB`.
- `backend/Dockerfile`: queda orientado a Railway, compila con `npm run build` y arranca con `npm start`.
- `docker-compose.yml`: mantiene un comando propio de desarrollo para regenerar Prisma Client y arrancar con nodemon si se revisa infraestructura local.
- `.env.example`, `backend/.env.example` y `frontend/.env.example`: se documentan URLs locales, Google OAuth, Cloudinary, SMTP, `BACKEND_URL`, `EXPO_PUBLIC_API_URL` y `RESET_DB`.
- `docs/infra/setup-despliegue.md`: nueva guia centralizada del flujo Railway desarrollo + Expo Go, variables, Dockerfile, Compose auxiliar, build/test/lint y Railway.
- `README.md`, `docs/backend/setup.md`, `docs/frontend/setup.md`, `docs/backend/api.md` y `CONTEXT.md`: se alinean con los scripts y endpoints actuales.

## Verificacion

- `npm run build` en `backend`.
- `npm test` en `backend`.
- `npm run lint` en `frontend` (sin errores; quedan warnings preexistentes de hooks/variables sin uso).
- `npm test` en `frontend`.
- `docker compose config --quiet`.

No se levanto `docker-compose up --build` para evitar dejar servicios de larga duracion corriendo durante la implementacion.
