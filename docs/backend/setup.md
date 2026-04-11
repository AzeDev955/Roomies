# Setup - Backend Roomies

## Requisitos

- Node.js 20+
- Una instancia de Prisma Postgres en local (`npx prisma dev`)

## Instalacion

```bash
cd backend
npm install
```

## Variables de entorno

Crea `backend/.env` con:

```env
DATABASE_URL="prisma+postgres://localhost:<PUERTO>/?api_key=<TU_API_KEY>"
JWT_SECRET=<cadena_aleatoria_larga>
GOOGLE_CLIENT_ID=<web_client_id_de_google>
CLOUDINARY_CLOUD_NAME=<tu_cloud_name>
CLOUDINARY_API_KEY=<tu_api_key>
CLOUDINARY_API_SECRET=<tu_api_secret>
```

> `DATABASE_URL` la proporciona el proceso `npx prisma dev` al arrancar.

## Primer uso (base de datos vacia)

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

Verificacion rapida:

```text
GET http://localhost:3000/ping  ->  pong
```

## Scripts disponibles

| Script | Descripcion |
|---|---|
| `npm run dev` | Servidor con hot-reload (`nodemon --exec ts-node src/index.ts`) |
| `npm run build` | Compila TypeScript a `dist/` (`npx prisma generate && tsc`) |
| `npm start` | Arranca el servidor compilado (`npx prisma db push --accept-data-loss && node dist/index.js`) |

## Despliegue en Railway

Railway gestiona el build y el arranque automaticamente usando los scripts de `package.json`. En este proyecto el backend se despliega con `backend/Dockerfile`, y el contenedor ejecuta `prisma db push` antes de levantar la app.

### 1. Base de datos

1. En Railway: **New Project -> Database -> PostgreSQL**.
2. Copia el valor de `DATABASE_URL` desde la pestana **Variables**.

### 2. Backend

1. Crea un servicio desde el repositorio GitHub.
2. En **Settings -> Source -> Root Directory** indica `/backend`.

### 3. Variables de entorno

En el servicio del backend anade:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | URL interna del servicio PostgreSQL de Railway |
| `JWT_SECRET` | Cadena aleatoria larga (min. 32 caracteres) |
| `GOOGLE_CLIENT_ID` | Web Client ID de Google Cloud Console |
| `CLOUDINARY_CLOUD_NAME` | Cloud name usado por inventario y justificantes |
| `CLOUDINARY_API_KEY` | API key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary |

### 4. Build y arranque automatico

Railway ejecuta:

```text
npm run build   -> prisma generate + tsc
npm start       -> prisma db push + node dist/index.js
```

### 5. Cron jobs incluidos en el arranque

Al levantar `src/index.ts`, el backend inicia dos tareas programadas:

- `0 2 * * *`: procesa `GastoRecurrente` activos cuyo `dia_del_mes` coincide con la fecha actual y genera gastos normales.
- `0 12 5 * *`: envia recordatorios push de deudas `PENDIENTE` a usuarios con `expo_push_token` registrado.

No hace falta una variable de entorno extra para Expo Push en backend: el envio usa `expo-server-sdk`, y los tokens llegan desde el cliente mediante `PATCH /api/usuarios/me/push-token`.

### 6. Dominio publico

En el servicio del backend, usa **Networking -> Generate Domain**. Railway genera una URL del tipo:

```text
https://<nombre-proyecto>.up.railway.app
```

### 7. Conectar el frontend

Actualiza `frontend/.env` con la URL generada:

```env
EXPO_PUBLIC_API_URL=https://<nombre-proyecto>.up.railway.app/api
```

Reinicia Metro para que la nueva URL quede horneada en el bundle:

```bash
cd frontend
npx expo start --clear
```

> Las variables `EXPO_PUBLIC_*` se resuelven en tiempo de compilacion del bundle.

---

## Decisiones de arquitectura

| Decision | Motivo |
|---|---|
| Express 5 | Manejo nativo de errores en handlers async |
| Prisma 7 | Cliente generado en `src/generated/prisma/`, con `prisma.config.ts` |
| `accelerateUrl` en PrismaClient | Requerido por Prisma 7 cuando la URL es `prisma+postgres://` |
| bcrypt 10 rondas | Balance coste/seguridad estandar para produccion |
| JWT 7 dias | Simplicidad MVP, sin refresh tokens por ahora |
| `req.usuario` en Express.Request | Extension de tipos en `src/types/express/index.d.ts` |

## Update 2026-04-09 - Backend real

- El backend actual usa `backend/Dockerfile` en Railway.
- Inventario y justificantes requieren:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- Scripts actuales:
  - `npm run dev` -> `nodemon --exec ts-node src/index.ts`
  - `npm run build` -> `npx prisma generate && tsc`
  - `npm start` -> `npx prisma db push --accept-data-loss && node dist/index.js`
- En entornos con red restringida, Prisma puede fallar al descargar binarios aunque el codigo este correcto.

## Update 2026-04-10 - Epica 12 (cobros y push)

- `GastoRecurrente` forma parte del schema y su cron diario se inicia automaticamente al arrancar el backend.
- Las mensualidades recurrentes son gestionadas por el casero propietario de la vivienda; al generarse, el casero queda como acreedor y se reparte entre inquilinos activos.
- `POST /api/deudas/:deudaId/justificante` reutiliza Cloudinary para guardar comprobantes en `roomies-justificantes`.
- `PATCH /api/usuarios/me/push-token` permite registrar o limpiar el `expo_push_token` del usuario autenticado.
- El cron mensual del dia 5 a las 12:00 envia recordatorios push de pago pendiente usando `expo-server-sdk`.

## Update 2026-04-11 - Epicas 13, 14 y 15

- `Vivienda` incorpora `mod_limpieza`, `mod_gastos` y `mod_inventario`; `PATCH /api/viviendas/:id` permite al casero propietario activar o desactivar modulos.
- `protegerModuloVivienda()` protege limpieza, gastos, deudas, cobros, mensualidades recurrentes e inventario con `403` cuando el modulo correspondiente esta desactivado.
- `Habitacion.precio` guarda el precio mensual privado solo en habitaciones habitables; el backend oculta precios de dormitorios ajenos en `/api/inquilino/vivienda`.
- `Gasto.factura_url` guarda facturas originales en Cloudinary. Los gastos aceptan `factura`, `fecha`, `implicadosIds` y `repartoManual`; los repartos automaticos se cuadran por centimos y el reparto manual acepta cuotas `0`.
- `PATCH /api/viviendas/:viviendaId/gastos/:gastoId` permite al casero editar concepto, fecha e importe, bloqueando el importe si alguna deuda hija esta `PAGADA`.
- `POST /api/viviendas/:viviendaId/gastos/:gastoId/factura` sube o reemplaza la factura original del gasto.
- La epica 15 no introduce cambios de backend; documenta un pulido frontend sobre tabs anidados de vivienda, perfil de propietario y jerarquia visual de gastos comunes.
