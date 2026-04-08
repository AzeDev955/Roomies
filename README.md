# Roomies

Aplicación móvil integral para la gestión de alquiler de habitaciones y co-living. Conecta a caseros e inquilinos para facilitar la convivencia, centralizar el reporte de incidencias y automatizar la gestión del día a día.

## Características (MVP)

La aplicación cuenta con dos perfiles de usuario bien diferenciados:

### 👑 Para el Casero / Gestor
* **Gestión Multipropiedad:** Creación y administración de diferentes viviendas y sus respectivas habitaciones, con autocompletado de dirección vía Mapbox.
* **Centro de mandos por vivienda:** Al entrar en una propiedad, un menú inferior propio con tres pestañas — Resumen, Incidencias y Tablón — sin perder la navegación principal.
* **Códigos de Invitación:** Generación de códigos únicos protegidos con autenticación biométrica (huella / PIN).
* **Gestión de Inquilinos:** Expulsión de inquilinos por habitación, y acceso al perfil de contacto completo (nombre, email, teléfono) de cada inquilino con un toque.
* **Centro de Incidencias:** Panel de control para recibir, gestionar y cambiar el estado de los problemas reportados en las viviendas.
* **Tablón de anuncios:** Publicación y eliminación de anuncios en cada vivienda; el casero puede moderar cualquier anuncio.

### 🛋️ Para el Inquilino
* **Mi Espacio:** Vista rápida de la vivienda, compañeros de piso, zonas comunes e incidencias.
* **Reporte Rápido:** Formulario ágil para reportar incidencias con selector de habitación y prioridad.
* **Seguimiento con permisos:** Selector de estado en las incidencias propias, del dormitorio o de zonas comunes. Solo lectura en las ajenas.
* **Ciclo de vida:** Posibilidad de abandonar la vivienda en cualquier momento desde el dashboard.

### 🔐 Autenticación
* Registro e inicio de sesión con **email y contraseña**.
* Inicio de sesión con **Google OAuth** (expo-auth-session + google-auth-library).
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
| Infraestructura | Docker Compose (PostgreSQL + backend + frontend) |

## 🗺️ Roadmap (Próximas versiones)
- [x] Módulo de limpieza: Asignación de tareas semanales rotativas.
- [x] Recordatorios de pago automáticos.
- [ ] Chat integrado Inquilino <-> Casero.
- [x] Tablón de anuncios para la vivienda.

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

Esto arrancará tres servicios:
| Servicio | Puerto | Descripción |
|---|---|---|
| `db` | 5432 | PostgreSQL 15 con volumen persistente |
| `backend` | 3001 | API Express — aplica el schema automáticamente al arrancar |
| `frontend` | 8080 | Metro bundler de Expo — escanea el QR con Expo Go |

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

Credenciales creadas:
| Rol | Email | Contraseña |
|---|---|---|
| CASERO | `casero@test.com` | `password123` |
| INQUILINO | `inquilino@test.com` | `password123` |

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
