# Epica 16 - Issue 246 - Infraestructura de tests y calidad

## Objetivo
Anadir una base repetible de tests para backend y frontend sin depender de `.env` privados ni arrancar servicios reales durante los smoke tests.

## Cambios principales
- Backend incorpora Vitest + Supertest con scripts `test`, `test:watch` y `test:coverage`.
- Express se separa en `backend/src/app.ts`, mientras `backend/src/index.ts` queda como entrypoint de runtime con servidor y cron jobs.
- Se anade `backend/tests/setup.ts` con variables de entorno de test seguras y locales.
- Frontend incorpora Jest Expo 54 + React Native Testing Library con scripts `test`, `test:watch` y `test:coverage`.
- `react-test-renderer` queda fijado a `19.1.0`, alineado con la version exacta de React.
- README y setup tecnico documentan comandos de test, coverage y lint.

## Verificacion
- `cd backend && npm test`
- `cd frontend && npm test`

## Riesgos conocidos
- `npm install` en backend sigue informando vulnerabilidades en el arbol de dependencias. No se ejecuta `npm audit fix` en este issue para evitar cambios amplios o breaking changes fuera de alcance.
