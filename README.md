# Roomies

Aplicación móvil integral para la gestión de alquiler de habitaciones y co-living. Conecta a caseros e inquilinos para facilitar la convivencia, centralizar el reporte de incidencias y automatizar la gestión del día a día.

## Características (MVP)

La aplicación cuenta con dos perfiles de usuario bien diferenciados:

### 👑 Para el Casero / Gestor

* **Gestión multipropiedad:** Creación y administración de viviendas y habitaciones, con autocompletado de dirección vía Mapbox.
* **Centro de mandos por vivienda:** Menú inferior propio con cuatro pestañas — Resumen, Incidencias, Tablón y Limpieza — sin perder la navegación principal.
* **Códigos de invitación:** Generación de códigos únicos protegidos con autenticación biométrica (huella / PIN).
* **Gestión de inquilinos:** Expulsión de inquilinos por habitación y acceso al perfil de contacto completo (nombre, email, teléfono).
* **Centro de incidencias:** Panel para recibir, gestionar y cambiar el estado (Pendiente → En Proceso → Resuelto) de los problemas reportados.
* **Tablón de anuncios:** Publicación y moderación de anuncios en cada vivienda.
* **Módulo de limpieza:** Gestión de zonas, turnos rotativos semanales y seguimiento de tareas por inquilino.

### 🛋️ Para el Inquilino

* **Mi vivienda:** Vista de habitación propia, compañeros de piso, zonas comunes e incidencias.
* **Reporte rápido:** Formulario con selector de habitación y prioridad (Sugerencia / Aviso / Urgente).
* **Seguimiento con permisos:** Selector de estado en incidencias propias, del dormitorio o de zonas comunes. Solo lectura en las ajenas.
* **Módulo de limpieza:** Vista del turno asignado con acción de marcar como completado.
* **Ciclo de vida:** Posibilidad de abandonar la vivienda en cualquier momento desde el dashboard.

### 🔐 Autenticación

* Registro e inicio de sesión con **email y contraseña** (con verificación de correo por magic link).
* Inicio de sesión con **Google OAuth** (`expo-auth-session` + `google-auth-library`).
* Selector de rol (Casero / Inquilino) para nuevos usuarios de Google, con re-emisión de JWT.

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React Native + Expo SDK 54 + expo-router ~6.0.23 |
| Backend | Node.js + Express 5 + TypeScript |
| ORM | Prisma 7 (PostgreSQL) |
| Auth | JWT + bcrypt + Google OAuth (`google-auth-library`) |
| Token storage | `expo-secure-store` |
| HTTP client | Axios con interceptor Bearer token |
| Geocoding | Mapbox Geocoding API |
| Infraestructura | Docker Compose / Railway |

## 🗺️ Roadmap

- [ ] Chat integrado Inquilino ↔ Casero.
- [ ] Recordatorios de pago automáticos.
- [ ] Notificaciones push avanzadas (nuevas incidencias, cambios de estado).

## ☁️ Despliegue en Railway

El proyecto tiene dos entornos desplegados en Railway:

| Entorno | URL de API |
|---|---|
| Desarrollo | `https://roomies-dev.up.railway.app/api` |
| Producción | `https://roomies-production-c884.up.railway.app/api` |

Cambia el valor en `frontend/.env` y reinicia Metro con `--clear` para hornear la nueva URL en el bundle. Ver pasos completos en [`docs/backend/setup.md`](docs/backend/setup.md).

---

## ⚙️ Levantar el entorno con Docker (recomendado)

### Prerrequisitos

* [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Pasos

1. Copia `.env.example` a `.env` y rellena `HOST_IP` con la IP de tu máquina en la red local:
   * Windows: `ipconfig` → IPv4 del adaptador Wi-Fi
   * Mac/Linux: `ifconfig` o `ip addr`

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

## ⚙️ Instalación manual (sin Docker)

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
cp .env.example .env   # elegir entorno de API
npx expo start
```

Escanea el QR con **Expo Go** o pulsa `a` / `i` para abrir el emulador.

---

## 📋 Documentación

| Recurso | Ruta |
|---|---|
| Arquitectura y convenciones | [`context.md`](context.md) |
| Setup frontend | [`docs/frontend/setup.md`](docs/frontend/setup.md) |
| API REST (referencia) | [`docs/backend/api.md`](docs/backend/api.md) |
| Setup backend / Railway | [`docs/backend/setup.md`](docs/backend/setup.md) |
| Historial de cambios | [`docs/changelog/`](docs/changelog/) |

---

*Desarrollado con café y código.*
