# Roomies

Aplicacion movil para gestionar pisos compartidos. Conecta a caseros e inquilinos para centralizar viviendas, incidencias, tablones, limpieza, inventario y ahora tambien cobros recurrentes con recordatorios push.

## Que incluye hoy

### Casero

- Gestion multipropiedad con alta de viviendas y habitaciones.
- Centro de mando por vivienda con resumen, incidencias, tablon y limpieza.
- Pestanas globales de `Mis viviendas`, `Cobros`, `Inventario`, `Tablon` y `Perfil`.
- Dashboard de cobros mensuales con detalle de deudas pagadas, pendientes y justificantes.
- Inventario por vivienda con subida de imagenes a Cloudinary.

### Inquilino

- Onboarding por codigo de invitacion y dashboard de vivienda.
- Tablon, limpieza, gastos, inventario y perfil en navegacion principal.
- Gestion de gastos puntuales y mensualidades.
- Subida de justificantes de pago y saldado de deudas desde la app.
- Check-in visual del inventario con conformidad por item.

### Automatizaciones

- Cron diario de mensualidades para convertir `GastoRecurrente` en gastos normales.
- Cron mensual de recordatorios push para deudas pendientes con `expo_push_token` registrado.

### Autenticacion

- Email y contrasena con verificacion por correo.
- Google OAuth.
- Selector de rol para altas nuevas desde Google.

## Stack tecnologico

| Capa | Tecnologia |
|---|---|
| Frontend | React Native + Expo SDK 54 + `expo-router` |
| Backend | Node.js + Express 5 + TypeScript |
| ORM | Prisma 7 (PostgreSQL) |
| Auth | JWT + bcrypt + Google OAuth |
| Media | Cloudinary + multer |
| Push | `expo-notifications` + `expo-server-sdk` |
| Infraestructura | Docker Compose + Railway |

## Roadmap

- [x] Modulo de limpieza
- [x] Cobros mensuales del casero
- [x] Mensualidades recurrentes
- [x] Recordatorios de pago por push
- [ ] Chat integrado Inquilino <-> Casero
- [ ] Notificaciones push avanzadas para incidencias y cambios de estado

## Entornos Railway

| Entorno | URL de API |
|---|---|
| Desarrollo | `https://roomies-dev.up.railway.app/api` |
| Produccion | `https://roomies-production-c884.up.railway.app/api` |

## Levantar el proyecto con Docker

### Prerrequisitos

- Docker Desktop

### Pasos

1. Copia `.env.example` a `.env` y rellena `HOST_IP`.
2. Levanta los servicios:

```bash
docker-compose up --build
```

| Servicio | Puerto | Descripcion |
|---|---|---|
| `db` | 5433 | PostgreSQL 15 |
| `backend` | 3001 | API Express |
| `frontend` | 8080 | Metro Bundler |

### Usuarios de prueba

| Rol | Email | Contrasena |
|---|---|---|
| CASERO | `casero@test.com` | `casero123` |
| INQUILINO | `inquilino@test.com` | `inquilino123` |

## Instalacion manual

### Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma db push
npx prisma db seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npx expo start
```

> Para probar push real necesitas una build nativa o development build. Expo Go no registra push tokens nativos.

## Tests y calidad

Backend usa Vitest + Supertest. Frontend usa Jest Expo 54 + React Native Testing Library.

```bash
cd backend
npm test
npm run test:watch
npm run test:coverage
```

```bash
cd frontend
npm test
npm run test:watch
npm run test:coverage
npm run lint
```

Los tests cargan valores de entorno de prueba y no necesitan `.env` privados. El backend expone `src/app.ts` para importar Express sin arrancar un puerto real ni programar cron jobs.

## Documentacion

| Recurso | Ruta |
|---|---|
| Contexto de proyecto | `CONTEXT.md` |
| Setup backend | `docs/backend/setup.md` |
| API REST | `docs/backend/api.md` |
| Setup frontend | `docs/frontend/setup.md` |
| Changelog tecnico | `docs/changelog/` |
