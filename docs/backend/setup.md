# Setup - Backend Roomies

## Requisitos

- Node.js 20+
- PostgreSQL local, PostgreSQL de Docker Compose o Prisma Postgres (`npx prisma dev`)

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

Con `DATABASE_URL` apuntando a una base disponible:

```bash
cd backend
npx prisma generate
npx prisma db push
```

Esto genera el cliente en `src/generated/prisma` y crea o actualiza las tablas segun `prisma/schema.prisma`. El repo no versiona migraciones SQL; para desarrollo y despliegue se usa `prisma db push`.

Seed opcional para datos de demo:

```bash
npx prisma db seed
```

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
| `npm test` | Ejecuta la suite de Vitest una vez |
| `npm run test:watch` | Ejecuta Vitest en modo watch |
| `npm run test:coverage` | Ejecuta Vitest y genera cobertura en `coverage/` |

## Variables obligatorias y opcionales

| Variable | Obligatoria | Descripcion |
|---|---|---|
| `DATABASE_URL` | Si | Conexion PostgreSQL usada por Prisma. |
| `JWT_SECRET` | Si | Firma de JWT. Usa una cadena larga y aleatoria. |
| `GOOGLE_CLIENT_ID` | Si | Web Client ID validado por `google-auth-library`. |
| `BACKEND_URL` | Si para correos reales | Base publica usada en enlaces de verificacion. Tiene fallback local. |
| `EMAIL_USER` / `EMAIL_PASS` | Opcional local | SMTP para enviar magic links de verificacion. |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Opcional para arrancar | Requerido para subir inventario, justificantes y facturas. |

## Tests

El backend usa Vitest + Supertest. La app Express vive en `src/app.ts` y se importa desde los tests sin llamar a `app.listen()` ni arrancar cron jobs reales.

Los tests cargan valores seguros en `tests/setup.ts`:

- `NODE_ENV=test`
- `DATABASE_URL=postgresql://roomies_test:roomies_test@localhost:5432/roomies_test`
- `JWT_SECRET=test-secret-not-for-production`
- `GOOGLE_CLIENT_ID=test-google-client-id`

Estos valores permiten importar controladores, rutas y Prisma sin depender de `.env` privados. Los tests que necesiten base de datos real deberan preparar una base aislada de test o mockear Prisma de forma explicita.

## Despliegue en Railway

El backend se prueba y despliega en Railway. En este proyecto Railway usa `backend/Dockerfile` para construir la imagen; el Dockerfile compila con `npm run build` y el contenedor arranca con `npm start`.

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

Railway ejecuta con el Dockerfile del backend:

```text
RUN npm run build
npm start
```

El script `npm start` ejecuta:

```text
npx prisma db push --accept-data-loss
node dist/index.js
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

## Decisiones de consistencia de datos

| Decision | Motivo |
|---|---|
| `Habitacion.inquilino_id` es unico cuando tiene valor | Un inquilino solo puede ocupar una habitacion activa. PostgreSQL permite multiples `NULL`, asi que las habitaciones vacias y zonas comunes no quedan bloqueadas. |
| `Deuda` es unica por `gasto_id` y `deudor_id` | Evita que un mismo gasto genere dos deudas para el mismo deudor. |
| `Deuda`, `FotoAsset`, `AsignacionLimpiezaFija` y `TurnoLimpieza` usan cascada desde su padre directo | Son registros dependientes sin sentido fuera del gasto, item o zona que los contiene. |
| `Incidencia.habitacion` y `Habitacion.inquilino` usan `SetNull` al borrar la entidad relacionada | Conserva el historial operativo aunque se elimine una habitacion o un usuario deje de existir. |
| Importes monetarios siguen como `Float` por compatibilidad MVP | La logica de reparto convierte a centimos antes de comparar o dividir. Migrar a `Decimal` o centimos enteros queda pendiente de migracion coordinada con frontend, API y datos existentes. |

El seed de demo esta pensado para desarrollo local: usa emails `example.test`, contrasenas obvias documentadas y se bloquea en `NODE_ENV=production` o Railway salvo que se fuerce con `ROOMIES_ALLOW_PRODUCTION_SEED=true`.

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

## Update 2026-04-11 - Epica 16 issue 246

- Se separa `src/app.ts` de `src/index.ts` para que Express pueda probarse sin abrir puerto ni arrancar cron jobs.
- Se anade Vitest + Supertest con scripts `test`, `test:watch` y `test:coverage`.
- La suite inicial valida `GET /ping` como smoke test de la app Express.
