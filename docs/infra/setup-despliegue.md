# Infraestructura, entornos y despliegue

## Objetivo

Esta guia concentra el flujo real de desarrollo con Docker Compose, las variables de entorno, Dockerfile de Railway y despliegue de Roomies. Debe mantenerse alineada con:

- `docker-compose.yml`
- `.env.example`
- `backend/.env.example`
- `frontend/.env.example`
- `backend/package.json`
- `frontend/package.json`

## Puertos y URLs

| Servicio | URL habitual |
|---|---|
| Backend desarrollo Docker | `http://localhost:3001/api` |
| Backend produccion Railway | `https://roomies-production-c884.up.railway.app/api` |
| Expo local para Expo Go | `http://localhost:8080` con Compose o Metro generado por `npx expo start --clear` |

URLs auxiliares si se revisa infraestructura local:

| Servicio | Ejecucion manual | Docker Compose |
|---|---:|---:|
| PostgreSQL | `localhost:5433` | `localhost:5433 -> db:5432` |
| Backend API | `http://localhost:3000` | `http://localhost:3001` |
| Frontend Expo/Metro | `http://localhost:8081` por defecto de Expo | `http://localhost:8080` |

## Variables de entorno

### Frontend `.env` para Expo Go

El flujo normal de testeo usa Docker local:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_MAPBOX_TOKEN=pk.ey...
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<web_client_id>
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<android_client_id>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
```

| Variable | Obligatoria | Uso |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Si | API local Docker en desarrollo o API Railway de produccion para builds release. |
| `EXPO_PUBLIC_MAPBOX_TOKEN` | Si para autocompletado | Token publico de Mapbox. |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Si para Google OAuth | Web Client ID usado por Expo. |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Recomendado | Client ID Android. |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Opcional | Client ID iOS. |

Cualquier cambio requiere reiniciar Metro con cache limpia:

```bash
npx expo start --clear
```

## Testeo diario

1. Copia `.env.example` a `.env` y ajusta secretos, `HOST_IP` y tokens publicos.
2. Levanta PostgreSQL, backend y Metro:

```bash
.\dev.bat
```

`dev.bat` se ejecuta desde la raiz, valida que exista `.env`, lanza `docker compose up --build -d` y despues ejecuta `npx expo start --clear` en `frontend`.

3. En `frontend/.env`, apunta a Docker local si usas Metro fuera del contenedor:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

Para Expo Go en movil fisico:

```env
EXPO_PUBLIC_API_URL=http://<HOST_IP>:3001/api
```

4. Si no usas el Metro del contenedor, arranca Expo:

```bash
cd frontend
npx expo start --clear
```

5. Abre la app desde Expo Go y valida contra Docker local.

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

Railway queda reservado para produccion y debe desplegar desde `main`. El backend se despliega con `backend/Dockerfile`; Railway lo usa para construir la imagen. Configura el servicio con root directory `/backend` y variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `BACKEND_URL`
- `EMAIL_USER`
- `EMAIL_PASS`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

El Dockerfile ejecuta `npm run build`. Al arrancar, `npm start` aplica `npx prisma db push --accept-data-loss` y levanta `node dist/index.js`.

No configures servicios Railway contra `dev` para desarrollo diario. Si existe un Railway de pruebas, mantenerlo pausado o desconectado de auto-deploy para evitar costes; Docker local cubre el flujo de cambios en desarrollo.

El seed automatico queda desactivado por defecto en `npm start`. Solo se ejecuta si `ROOMIES_SEED_ON_START=true`, y no debe habilitarse en produccion salvo una carga controlada.

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
