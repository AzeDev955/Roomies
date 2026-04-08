# Roomies

Aplicación móvil integral para la gestión de alquiler de habitaciones y co-living. Conecta a caseros e inquilinos para facilitar la convivencia, centralizar el reporte de incidencias y automatizar la gestión del día a día.

## Características (MVP)

La aplicación cuenta con dos perfiles de usuario bien diferenciados:

### Para el Casero / Gestor

- **Gestión multipropiedad:** Creación y administración de viviendas y sus habitaciones (con autocompletado de dirección vía Mapbox).
- **Códigos de invitación:** Generación de códigos únicos de un solo uso para vincular inquilinos a habitaciones (biometría para revelar el código).
- **Centro de mando por vivienda:** Panel con habitaciones, estados de ocupación y accesos rápidos.
- **Gestión de incidencias:** Panel completo para recibir, seguir y cambiar el estado (Pendiente → En Proceso → Resuelto) de los problemas reportados.
- **Tablón de anuncios:** Publicación y lectura de anuncios compartidos por vivienda.
- **Módulo de limpieza:** Gestión de zonas, turnos rotativos semanales y seguimiento de tareas por inquilino.

### Para el Inquilino

- **Mi vivienda:** Vista de habitación propia, compañeros de piso y zonas comunes.
- **Reporte de incidencias:** Formulario con selector de ubicación y prioridad (Sugerencia / Aviso / Urgente).
- **Seguimiento de incidencias:** Visualización y cambio de estado de sus propios reportes.
- **Tablón:** Lectura y publicación de anuncios del piso.
- **Módulo de limpieza:** Vista del turno asignado con acción de marcar como completado.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React Native + Expo (SDK 54) |
| Routing | `expo-router` — file-based |
| Backend | Node.js + Express 5 + TypeScript |
| ORM | Prisma 7 (PostgreSQL) |
| Auth | JWT + bcrypt + Google OAuth |
| Infraestructura | Docker Compose / Railway |

## Levantar el entorno con Docker (recomendado)

### Prerrequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Pasos

1. Copia `.env.example` a `.env` en la raíz y completa `HOST_IP` con la IP de tu máquina en la red local:
   - Windows: `ipconfig` → IPv4 del adaptador Wi-Fi
   - Mac/Linux: `ifconfig` o `ip addr`

2. Levanta todos los servicios:

```bash
docker-compose up --build
```

| Servicio | Puerto | Descripción |
|---|---|---|
| `db` | 5433 | PostgreSQL 15 con volumen persistente |
| `backend` | 3001 | API Express — aplica schema + seed al arrancar |
| `frontend` | 8080 | Metro bundler de Expo — escanea el QR con Expo Go |

> El puerto 8080 se usa en lugar de 8081 para evitar conflictos con reglas de firewall en Windows.

### Usuarios de prueba (seed)

| Rol | Email | Contraseña |
|---|---|---|
| CASERO | `casero@test.com` | `casero123` |
| INQUILINO | `inquilino@test.com` | `inquilino123` |

---

## Instalación manual (sin Docker)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # configurar DATABASE_URL y JWT_SECRET
npx prisma db push
npx prisma db seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npx expo start
```

Escanea el QR con **Expo Go** o pulsa `a` / `i` para abrir el emulador.

---

## Despliegue en producción (Railway)

El backend y la base de datos se despliegan en [Railway](https://railway.app). Ver pasos completos en [`docs/backend/setup.md`](docs/backend/setup.md).

El proyecto tiene dos entornos en Railway:

| Entorno | Variable |
|---|---|
| Desarrollo | `EXPO_PUBLIC_API_URL=https://roomies-dev.up.railway.app/api` |
| Producción | `EXPO_PUBLIC_API_URL=https://roomies-production-c884.up.railway.app/api` |

Cambia el valor en `frontend/.env` y reinicia Metro con `--clear` para hornear la nueva URL en el bundle.

---

## Roadmap

- [ ] Recordatorios de pago automáticos.
- [ ] Chat integrado Inquilino ↔ Casero.
- [ ] Notificaciones push avanzadas (nuevas incidencias, cambios de estado).

---

## Documentación

| Recurso | Ruta |
|---|---|
| Arquitectura y convenciones | [`context.md`](context.md) |
| Setup frontend | [`docs/frontend/setup.md`](docs/frontend/setup.md) |
| API REST (referencia) | [`docs/backend/api.md`](docs/backend/api.md) |
| Setup backend / Railway | [`docs/backend/setup.md`](docs/backend/setup.md) |
| Historial de cambios | [`docs/changelog/`](docs/changelog/) |

---

*Desarrollado con café y código.*
