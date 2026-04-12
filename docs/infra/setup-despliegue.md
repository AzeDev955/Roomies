# Infraestructura, entornos y despliegue

## Objetivo

Esta guia concentra el flujo real de testeo con Expo Go contra Railway desarrollo, las variables de entorno, Dockerfile de Railway y despliegue de Roomies. Debe mantenerse alineada con:

- `docker-compose.yml`
- `.env.example`
- `backend/.env.example`
- `frontend/.env.example`
- `backend/package.json`
- `frontend/package.json`

## Puertos y URLs

| Servicio | URL habitual |
|---|---|
| Backend Railway desarrollo | `https://roomies-dev.up.railway.app/api` |
| Backend Railway produccion | `https://roomies-production-c884.up.railway.app/api` |
| Expo local para Expo Go | Metro generado por `npx expo start --clear` |

URLs auxiliares si se revisa infraestructura local:

| Servicio | Ejecucion manual | Docker Compose |
|---|---:|---:|
| PostgreSQL | `localhost:5433` | `localhost:5433 -> db:5432` |
| Backend API | `http://localhost:3000` | `http://localhost:3001` |
| Frontend Expo/Metro | `http://localhost:8081` por defecto de Expo | `http://localhost:8080` |

## Variables de entorno

### Frontend `.env` para Expo Go

El flujo normal de testeo usa `frontend/.env` con Railway desarrollo:

```env
EXPO_PUBLIC_API_URL=https://roomies-dev.up.railway.app/api
EXPO_PUBLIC_MAPBOX_TOKEN=pk.ey...
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<web_client_id>
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<android_client_id>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
```

| Variable | Obligatoria | Uso |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Si | API Railway desarrollo para testeo diario o produccion para builds release. |
| `EXPO_PUBLIC_MAPBOX_TOKEN` | Si para autocompletado | Token publico de Mapbox. |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Si para Google OAuth | Web Client ID usado por Expo. |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Recomendado | Client ID Android. |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Opcional | Client ID iOS. |

Cualquier cambio requiere reiniciar Metro con cache limpia:

```bash
npx expo start --clear
```

## Testeo diario

1. Comprueba que los cambios de backend esten desplegados en Railway desarrollo.
2. En `frontend/.env`, apunta a:

```env
EXPO_PUBLIC_API_URL=https://roomies-dev.up.railway.app/api
```

3. Arranca Expo:

```bash
cd frontend
npx expo start --clear
```

4. Abre la app desde Expo Go y valida contra Railway desarrollo.

## Docker Compose opcional

`docker-compose.yml` no es el flujo habitual de testeo. Queda para revisar integracion local si alguna vez hace falta levantar PostgreSQL, backend y Metro en contenedores.

Si se usa, copia `.env.example` a `.env`, ajusta las variables y ejecuta:

```bash
docker-compose up --build
```

El servicio `backend` de Compose sobreescribe el comando de la imagen de Railway para trabajar en modo desarrollo:

1. `npx prisma generate`
2. `npx prisma db push --accept-data-loss`
3. `npm run dev`

Si `RESET_DB=true`, ejecuta `npx prisma db push --force-reset` y `npx prisma db seed` antes de arrancar.

## Backend local opcional

No se usa para testeo funcional diario, pero sirve para compilar o depurar una incidencia concreta:

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev
```

## Build, tests y calidad

Backend:

```bash
cd backend
npm run build
npm test
```

Frontend:

```bash
cd frontend
npm run lint
npm test
```

## Despliegue

### Backend Railway

El backend se despliega con `backend/Dockerfile`; Railway lo usa para construir la imagen. Configura el servicio con root directory `/backend` y variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `BACKEND_URL`
- `EMAIL_USER`
- `EMAIL_PASS`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

El Dockerfile ejecuta `npm run build`. Al arrancar, `npm start` aplica `npx prisma db push --accept-data-loss`, ejecuta `npx prisma db seed` cuando `RAILWAY_ENVIRONMENT_NAME` identifica desarrollo (`development`, `dev` o `desarrollo`) y levanta `node dist/index.js`.

El seed queda bloqueado en Railway produccion salvo override explicito con `ROOMIES_ALLOW_PRODUCTION_SEED=true`. Para forzarlo en otro entorno controlado se puede usar `ROOMIES_SEED_ON_START=true`, manteniendo el guard de seguridad del propio seed.

### Frontend EAS

`frontend/eas.json` define perfiles `preview` y `production` con URL de produccion. Para cambiar entorno de build, ajusta `EXPO_PUBLIC_API_URL` y los client IDs de Google en el perfil correspondiente.

```bash
cd frontend
eas build --platform android --profile preview
```

## Archivos ignorados

No versionar secretos ni artefactos locales:

- `.env`, `.env.local`, `.env.*.local`
- `node_modules/`
- `backend/dist/`
- `coverage/`
- `frontend/.expo/`, `frontend/dist/`, `frontend/web-build/`
- carpetas nativas generadas `frontend/ios` y `frontend/android`
