# Setup — Backend Roomies

## Requisitos

- Node.js 20+
- Una instancia de Prisma Postgres en local (`npx prisma dev`)

## Instalación

```bash
cd backend
npm install
```

## Variables de entorno

Crea `backend/.env` con:

```env
DATABASE_URL="prisma+postgres://localhost:<PUERTO>/?api_key=<TU_API_KEY>"
JWT_SECRET=<cadena_aleatoria_larga>
CLOUDINARY_CLOUD_NAME=<tu_cloud_name>
CLOUDINARY_API_KEY=<tu_api_key>
CLOUDINARY_API_SECRET=<tu_api_secret>
```

> `DATABASE_URL` la proporciona el proceso `npx prisma dev` al arrancar.

## Primer uso (base de datos vacía)

Con `npx prisma dev` corriendo en otra terminal:

```bash
cd backend
npx prisma migrate dev --name init
```

Esto crea todas las tablas en la base de datos.

## Arrancar en desarrollo

```bash
cd backend
npm run dev
```

El servidor queda disponible en `http://localhost:3000`.

Verificación rápida:

```
GET http://localhost:3000/ping  →  pong
```

## Scripts disponibles

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor con hot-reload (nodemon + ts-node) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Arranca el servidor compilado (`dist/index.js`) |

## Despliegue en Railway

Railway gestiona el build y el arranque automáticamente usando los scripts de `package.json`. No se necesita `Dockerfile` ni configuración adicional.

Nota: en la configuraciÃ³n actual del proyecto, Railway despliega el backend usando `backend/Dockerfile`, y el contenedor ejecuta `prisma db push` al arrancar antes de `npm run dev`.

### 1. Base de datos

1. En el panel de Railway → **New Project → Database → PostgreSQL**
2. Una vez creado el servicio, ve a su pestaña **Variables** y copia el valor de `DATABASE_URL` (URL de conexión interna)

### 2. Backend

1. **New Service → GitHub Repo** → selecciona el repositorio
2. Ve a **Settings → Source → Root Directory** y escribe `/backend`
   > Esto le indica a Railway que ignore el resto del monorepo y trate `/backend` como la raíz del proyecto Node.js

### 3. Variables de entorno

En el servicio del backend → pestaña **Variables**, añade:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | URL interna del servicio PostgreSQL de Railway |
| `JWT_SECRET` | Cadena aleatoria larga (mín. 32 caracteres) |
| `GOOGLE_CLIENT_ID` | Web Client ID de Google Cloud Console |

### 4. Build y arranque automático

Railway detecta `package.json` y ejecuta en orden:

```
npm run build   →  prisma generate + tsc
npm start       →  prisma db push + node dist/index.js
```

Las migraciones del schema y el arranque del servidor son completamente automáticos en cada despliegue.

### 5. Dominio público

En el servicio del backend → **Networking → Generate Domain**. Railway genera una URL con el formato:

```
https://<nombre-proyecto>.up.railway.app
```

### 6. Conectar el frontend

Actualiza `frontend/.env` con la URL generada:

```env
EXPO_PUBLIC_API_URL=https://<nombre-proyecto>.up.railway.app/api
```

Reinicia Metro para que la nueva URL quede horneada en el bundle:

```bash
cd frontend
npx expo start --clear
```

> Las variables `EXPO_PUBLIC_*` se resuelven en tiempo de compilación del bundle — cualquier cambio requiere reiniciar Metro con `--clear`.

---

## Decisiones de arquitectura

| Decisión | Motivo |
|---|---|
| Express 5 | Manejo nativo de errores en handlers async (sin wrapper catch) |
| Prisma 7 | Cliente generado en `src/generated/prisma/`, configuración en `prisma.config.ts` en vez de en el schema |
| `accelerateUrl` en PrismaClient | Requerido por Prisma 7 cuando la URL es `prisma+postgres://` |
| bcrypt 10 rondas | Balance coste/seguridad estándar para producción |
| JWT 7 días | Simplicidad MVP: sin refresh tokens por ahora |
| `req.usuario` en Express.Request | Extensión de tipos en `src/types/express/index.d.ts` para que TypeScript acepte la inyección del payload JWT |
## Update 2026-04-09 - Backend real

- El backend actual usa `backend/Dockerfile` en Railway.
- Inventario requiere tambien:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- Scripts actuales:
  - `npm run dev` -> `nodemon --exec ts-node src/index.ts`
  - `npm run build` -> `npx prisma generate && tsc`
  - `npm start` -> `npx prisma db push --accept-data-loss && node dist/index.js`
- En entornos con red restringida, Prisma puede fallar al descargar binarios aunque el codigo este correcto.
