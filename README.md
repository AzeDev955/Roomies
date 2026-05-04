# Roomies

Aplicacion movil para gestionar pisos compartidos. Conecta a caseros e inquilinos para centralizar viviendas, incidencias, tablones, limpieza, inventario y ahora tambien cobros recurrentes con recordatorios push.

## Que incluye hoy

### Casero

- Gestion multipropiedad con alta de viviendas y habitaciones.
- Centro de mando por vivienda con resumen, incidencias, tablon y limpieza.
- Limpieza por habitaciones responsables, asignaciones fijas y exportacion CSV compatible con Excel.
- Pestanas globales de `Mis viviendas`, `Cobros`, `Inventario`, `Tablon` y `Perfil`.
- Dashboard de cobros mensuales con detalle de deudas pagadas, pendientes y justificantes.
- Inventario por vivienda con subida de imagenes a Cloudinary y estado de validacion del inquilino.

### Inquilino

- Onboarding por codigo de invitacion y dashboard de vivienda.
- Tablon, limpieza, gastos, inventario y perfil en navegacion principal.
- Gestion de gastos puntuales y mensualidades.
- Subida de justificantes de pago y saldado de deudas desde la app.
- Check-in visual del inventario con conformidad por item visible: vivienda, zonas comunes y habitacion propia.
- Consulta de terminos de uso y politica de privacidad desde la app.

### Automatizaciones

- Cron diario de mensualidades para convertir `GastoRecurrente` en gastos normales.
- Cron mensual de recordatorios push para deudas pendientes con `expo_push_token` registrado.

### Autenticacion

- Email y contrasena con sesion inmediata tras registro; la verificacion por correo queda como flujo historico/compatible y no bloquea login.
- Google OAuth.
- Selector de rol para altas nuevas desde Google.
- Aceptacion explicita de terminos y privacidad en registro manual y altas nuevas desde Google.

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
- [x] Exportacion de limpiezas
- [x] Terminos de uso y politica de privacidad
- [x] Cobros mensuales del casero
- [x] Mensualidades recurrentes
- [x] Recordatorios de pago por push
- [ ] Chat integrado Inquilino <-> Casero
- [ ] Notificaciones push avanzadas para incidencias y cambios de estado

## Entornos

| Entorno | URL de API |
|---|---|
| Desarrollo local Docker | `http://localhost:3001/api` |
| Produccion Railway | `https://roomies-production-c884.up.railway.app/api` |

## Testeo habitual con Docker y Expo Go

### Prerrequisitos

- Node.js 20+
- Docker Desktop
- Expo Go instalado en el movil

### Pasos

1. Copia `.env.example` a `.env` y ajusta `HOST_IP` si vas a probar en movil fisico.
2. Levanta PostgreSQL, backend y Metro con Docker Compose:

```bash
.\dev.bat
```

El script ejecuta `docker compose up --build` desde la raiz y comprueba que exista `.env`.

3. Usa Docker local como API en `frontend/.env` si arrancas Expo fuera de Compose:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

Para Expo Go en movil fisico, usa la IP LAN:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.X:3001/api
```

4. Si prefieres Metro fuera del contenedor:

```bash
cd frontend
npm install
npx expo start --clear
```

5. Abre el QR con Expo Go.

> Railway queda reservado para produccion desde `main`; no debe usarse como backend de desarrollo diario.

## Docker y Railway

El desarrollo diario usa `docker-compose.yml`, que levanta PostgreSQL, backend en `http://localhost:3001` y Metro en `http://localhost:8080`.

En Windows, `dev.bat` levanta todos los contenedores con un solo comando.

El `backend/Dockerfile` se usa para que Railway construya la imagen del backend de produccion desde `main`. El contenedor compila con `npm run build`; al arrancar ejecuta `npm start`, aplica `prisma db push --accept-data-loss` y levanta `dist/index.js`.

Consulta `docs/infra/setup-despliegue.md` para el detalle completo de variables, URLs por entorno y despliegue.

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
npx prisma generate
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
| Infraestructura y despliegue | `docs/infra/setup-despliegue.md` |
| Changelog tecnico | `docs/changelog/` |
