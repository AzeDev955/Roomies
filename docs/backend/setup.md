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

## Decisiones de arquitectura

| Decisión | Motivo |
|---|---|
| Express 5 | Manejo nativo de errores en handlers async (sin wrapper catch) |
| Prisma 7 | Cliente generado en `src/generated/prisma/`, configuración en `prisma.config.ts` en vez de en el schema |
| `accelerateUrl` en PrismaClient | Requerido por Prisma 7 cuando la URL es `prisma+postgres://` |
| bcrypt 10 rondas | Balance coste/seguridad estándar para producción |
| JWT 7 días | Simplicidad MVP: sin refresh tokens por ahora |
| `req.usuario` en Express.Request | Extensión de tipos en `src/types/express/index.d.ts` para que TypeScript acepte la inyección del payload JWT |
